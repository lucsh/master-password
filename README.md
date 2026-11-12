# Why?

Using the same password for multiple accounts is very
**unsafe**. If one of those sites gets compromisedit will affect all your accounts, possibly even leading to identity
theft.
The idea behind this proyect it that you memorise just one, reasonably long, secure
**master password** and use it to generate non-dictionary complex passwords.
This password generator works using JavaScript and the SHA-256 implementation extracted from digitalbazaar/forge, entirely within the page and **no data is ever passed back to the server**.


## Development and verification

Install the locked dependencies with `npm ci`, run `npm test`, and build with
`npm run build`. The production static export is in `dist/`, including the
offline service worker. `npm start` launches the development server.

The compatibility fixtures protect existing password outputs, including legacy
edge cases. Do not regenerate fixtures to hide an algorithm change.

## Deployment

The verified document root for https://pass.luc.sh is `/home/bornar/pass.luc.sh`.
The local SSH connection is `bornar@93.127.192.202` on port `65002`, using the
existing SSH authentication and known-host record.

After tests and a production build, run
`bash scripts/deploy-hostinger.sh --dry-run`. Commit and push the release, then
run `bash scripts/deploy-hostinger.sh --deploy` from a clean checkout. This uses
the personal site's local SSH/rsync approach: back up the existing site outside
the public root, stage the artifact, upload assets first, and replace HTML and
the service worker last. It preserves the root permissions, existing hosting
configuration, legacy `v1/`, and old hashed assets. It never deletes remote files.

The script adds a scoped revalidation rule for HTML and the service worker to
avoid the existing month-long cache default. Fingerprinted main/vendor/style
CSS and JavaScript bundles use one-year immutable caching; unversioned assets
retain their existing policy. The original `.htaccess` is included
in the backup. The remote release path is saved in `.release/latest-remote.txt`;
run `bash <release-path>/rollback.sh` over SSH to restore the previous site.
Verify the live HTML checksum and referenced assets after each deployment.
