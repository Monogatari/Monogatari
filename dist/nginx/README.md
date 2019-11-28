# Sample Nginx configuration

## How to
1. Copy content of this directory to your Nginx directory (e.g. /etc/nginx).
2. If you want to use "localhost" server name you need to delete conf.d/default.conf from Nginx directory or at least 
modify it to avoid name conflict.
3. Copy your Monogatari files to path specified in sites-enabled/localhost.conf in root clause or change root clause 
to reflect position of your files.
4. Reload Nginxs configuraton with ```nginx -s reload```

## sites-enabled vs sites-available
"sites-available" holds all sites configurations, "sites-enabled" holds sites configurations to be published. 
Normally "site-enabled" contains only symbolic links to configurations in "site-available" but because links are not 
platform agnostic we provide simple copy. If you want to change configuration be sure to create symbolic links or 
maintain content of these two directories manually.