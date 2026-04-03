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
import Switch from '@/components/elements/Switch';
import toggleVisibility from '@/api/server/settings/toggleVisibility';
import useFlash from '@/plugins/useFlash';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import ScreenBlock from '@/components/elements/ScreenBlock';
import ServerErrorSvg from '@/assets/images/server_error.svg';

export default () => {
    const username = useStoreState((state) => state.user.data!.username);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);

    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const node = ServerContext.useStoreState((state) => state.server.data!.node);
    const sftp = ServerContext.useStoreState((state) => state.server.data!.sftpDetails, isEqual);
    const isServerOwner = ServerContext.useStoreState((state) => state.server.data!.serverOwner);
    const initialHideFromAdmin = ServerContext.useStoreState(
        (state) => (state.server.data as any).hideFromAdmin ?? false
    );

    const [hideFromAdmin, setHideFromAdmin] = useState<boolean>(initialHideFromAdmin);
    const [loading, setLoading] = useState(false);
    const { clearFlashes, addError, addSuccess } = useFlash();

    const handleVisibilityToggle = (value: boolean) => {
        clearFlashes('settings');
        setLoading(true);
        toggleVisibility(uuid, value)
            .then(() => {
                setHideFromAdmin(value);
                addSuccess(
                    value
                        ? 'Server is now hidden from admin Client Panel access.'
                        : 'Server is now visible to admins via Client Panel.',
                    'settings'
                );
            })
            .catch((error) => {
                console.error(error);
                addError('Failed to update server privacy setting.', 'settings');
            })
            .finally(() => setLoading(false));
    };

    if (rootAdmin && !isServerOwner && initialHideFromAdmin) {
        return (
            <ScreenBlock
                title={'Access Restricted'}
                image={ServerErrorSvg}
                message={'The server owner has restricted admin access to this server via the Client Panel.'}
            />
        );
    }

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
                    {isServerOwner && (
                        <TitledGreyBox title={'Server Privacy'} css={tw`mb-6 md:mb-10`}>
                            <div css={tw`relative`}>
                                <SpinnerOverlay visible={loading} />
                                <div css={tw`flex items-center justify-between`}>
                                    <div css={tw`flex-1 mr-4`}>
                                        <p css={tw`text-sm font-medium text-neutral-100`}>
                                            Hide from admin Client Panel
                                        </p>
                                        <p css={tw`text-xs text-neutral-400 mt-1`}>
                                            When enabled, admins cannot access this server via the Client Panel.
                                            The server remains visible in the Admin Panel.
                                        </p>
                                    </div>
                                    <Switch
                                        name={'hide_from_admin'}
                                        defaultChecked={hideFromAdmin}
                                        onChange={(e) => handleVisibilityToggle(e.target.checked)}
                                    />
                                </div>
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
