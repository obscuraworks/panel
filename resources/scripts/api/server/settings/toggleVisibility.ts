/**
 * INSTRUKSI:
 * Letakkan file ini di:
 * resources/scripts/api/server/settings/toggleVisibility.ts
 */

import http from '@/api/http';

/**
 * Memanggil PUT /api/client/servers/{server}/settings/visibility
 * untuk mengubah status hide_from_admin.
 *
 * Hanya dapat dipanggil oleh owner server. Jika dipanggil oleh
 * bukan owner, server akan merespons dengan 403 Forbidden.
 *
 * @param uuid   - UUID server (bukan uuidShort)
 * @param hideFromAdmin - true untuk menyembunyikan dari admin, false untuk membuka kembali
 */
export default (uuid: string, hideFromAdmin: boolean): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.put(`/api/client/servers/${uuid}/settings/visibility`, {
            hide_from_admin: hideFromAdmin,
        })
            .then(() => resolve())
            .catch(reject);
    });
};
