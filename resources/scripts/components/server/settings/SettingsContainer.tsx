/**
 * INSTRUKSI:
 * Ganti seluruh isi file:
 * resources/scripts/components/server/settings/SettingsContainer.tsx
 * dengan file ini.
 *
 * Perubahan dari versi original:
 * - Import komponen Switch bawaan Pterodactyl
 * - Import fungsi toggleVisibility API
 * - Tambah state hideFromAdmin + handler
 * - Tambah blok UI "Server Privacy" di kolom kanan (di atas ReinstallServerBox)
 */

import React, { useState } from 'react';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { ServerContext } from '@/state/server';
import { useStoreState } from 'easy-peasy';
import RenameServerBox from '@/components/server/settings/RenameServerBox';
import FlashMessageRender from '@/components/FlashMessageRender';
import Can from '@/components/elements/Can';
import ReinstallServerBox from '@/components/server/settings/ReinstallServerBox';
import tw from 'twin.macro';
import Input from '@/components/elements/Input';
import Label from '@/components/elements/Label';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import isEqual from 'react-fast-compare';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { ip } from '@/lib/formatters';
import { Button } from '@/components/elements/button/index';
// [ADDED] Import Switch dan API helper
import Switch from '@/components/elements/Switch';
import toggleVisibility from '@/api/server/settings/toggleVisibility';
import useFlash from '@/plugins/useFlash';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';

export default () => {
    const username = useStoreState((state) => state.user.data!.username);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const node = ServerContext.useStoreState((state) => state.server.data!.node);
    const sftp = ServerContext.useStoreState((state) => state.server.data!.sftpDetails, isEqual);

    // [ADDED] Ambil nilai hide_from_admin dan serverOwner dari server state
    const isServerOwner = ServerContext.useStoreState((state) => state.server.data!.serverOwner);
    const initialHideFromAdmin = ServerContext.useStoreState(
        (state) => (state.server.data as any).hideFromAdmin ?? false
    );

    // [ADDED] Local state untuk toggle
    const [hideFromAdmin, setHideFromAdmin] = useState<boolean>(initialHideFromAdmin);
    const [loading, setLoading] = useState(false);
    const { clearFlashes, addError, addSuccess } = useFlash();

    // [ADDED] Handler ketika switch diubah
    const handleVisibilityToggle = (value: boolean) => {
        clearFlashes('settings');
        setLoading(true);
        toggleVisibility(uuid, value)
            .then(() => {
                setHideFromAdmin(value);
                addSuccess(
                    value
                        ? 'Server sekarang disembunyikan dari akses admin melalui Client Panel.'
                        : 'Server sekarang dapat diakses admin melalui Client Panel.',
                    'settings'
                );
            })
            .catch((error) => {
                console.error(error);
                addError('Gagal mengubah pengaturan privasi server.', 'settings');
            })
            .finally(() => setLoading(false));
    };

    return (
        <ServerContentBlock title={'Settings'}>
            <FlashMessageRender byKey={'settings'} css={tw`mb-4`} />
            <div css={tw`md:flex`}>
                <div css={tw`w-full md:flex-1 md:mr-10`}>
                    <Can action={'file.sftp'}>
                        <TitledGreyBox title={'SFTP Details'} css={tw`mb-6 md:mb-10`}>
                            <div>
                                <Label>Server Address</Label>
                                <CopyOnClick text={`sftp://${ip(sftp.ip)}:${sftp.port}`}>
                                    <Input type={'text'} value={`sftp://${ip(sftp.ip)}:${sftp.port}`} readOnly />
                                </CopyOnClick>
                            </div>
                            <div css={tw`mt-6`}>
                                <Label>Username</Label>
                                <CopyOnClick text={`${username}.${id}`}>
                                    <Input type={'text'} value={`${username}.${id}`} readOnly />
                                </CopyOnClick>
                            </div>
                            <div css={tw`mt-6 flex items-center`}>
                                <div css={tw`flex-1`}>
                                    <div css={tw`border-l-4 border-cyan-500 p-3`}>
                                        <p css={tw`text-xs text-neutral-200`}>
                                            Your SFTP password is the same as the password you use to access this panel.
                                        </p>
                                    </div>
                                </div>
                                <div css={tw`ml-4`}>
                                    <a href={`sftp://${username}.${id}@${ip(sftp.ip)}:${sftp.port}`}>
                                        <Button.Text variant={Button.Variants.Secondary}>Launch SFTP</Button.Text>
                                    </a>
                                </div>
                            </div>
                        </TitledGreyBox>
                    </Can>
                    <TitledGreyBox title={'Debug Information'} css={tw`mb-6 md:mb-10`}>
                        <div css={tw`flex items-center justify-between text-sm`}>
                            <p>Node</p>
                            <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>{node}</code>
                        </div>
                        <CopyOnClick text={uuid}>
                            <div css={tw`flex items-center justify-between mt-2 text-sm`}>
                                <p>Server ID</p>
                                <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>{uuid}</code>
                            </div>
                        </CopyOnClick>
                    </TitledGreyBox>
                </div>
                <div css={tw`w-full mt-6 md:flex-1 md:mt-0`}>
                    {/*
                        [ADDED] Blok Server Privacy.
                        Hanya ditampilkan ke owner server — subuser tidak perlu tahu
                        tentang fitur ini karena tidak punya akses untuk mengubahnya.
                    */}
                    {isServerOwner && (
                        <TitledGreyBox title={'Server Privacy'} css={tw`mb-6 md:mb-10`}>
                            <div css={tw`relative`}>
                                <SpinnerOverlay visible={loading} />
                                <div css={tw`flex items-center justify-between`}>
                                    <div css={tw`flex-1 mr-4`}>
                                        <p css={tw`text-sm font-medium text-neutral-100`}>
                                            Hide this server from admins
                                        </p>
                                        <p css={tw`text-xs text-neutral-400 mt-1`}>
                                            Ketika aktif, admin tidak dapat mengakses server ini
                                            melalui Client Panel (konsol, file manager, dll).
                                            Server tetap terlihat di Admin Panel, namun akses
                                            client-level diblokir.
                                        </p>
                                    </div>
                                    <Switch
                                        name={'hide_from_admin'}
                                        defaultChecked={hideFromAdmin}
                                        onChange={(e) => handleVisibilityToggle(e.target.checked)}
                                    />
                                </div>
                                {hideFromAdmin && (
                                    <div css={tw`mt-3 border-l-4 border-yellow-500 p-3`}>
                                        <p css={tw`text-xs text-yellow-300`}>
                                            ⚠️ Mode privasi aktif. Admin panel masih bisa melihat server ini,
                                            tetapi tidak dapat mengaksesnya melalui Client Panel.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TitledGreyBox>
                    )}

                    <Can action={'settings.rename'}>
                        <div css={tw`mb-6 md:mb-10`}>
                            <RenameServerBox />
                        </div>
                    </Can>
                    <Can action={'settings.reinstall'}>
                        <ReinstallServerBox />
                    </Can>
                </div>
            </div>
        </ServerContentBlock>
    );
};
