const { Client } = require('ssh2');

const nginxConfig = `server {
    server_name amerigam.com www.amerigam.com;
    client_max_body_size 100M;

    location /uploads/ {
        alias /root/Amerigam/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        try_files $uri =404;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/amerigam.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/amerigam.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = www.amerigam.com) {
        return 301 https://$host$request_uri;
    }

    if ($host = amerigam.com) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name amerigam.com www.amerigam.com;
    return 404;
}
`;

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected! Updating Nginx config...');
  // Write new config and test
  conn.exec(`cat << 'EOF' > /etc/nginx/sites-available/amerigam\n${nginxConfig}\nEOF\nnginx -t && systemctl reload nginx`, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.on('close', code => {
      console.log(`Nginx update completed with code ${code}`);
      conn.end();
    });
  });
}).connect({
  host: '168.144.126.4',
  port: 22,
  username: 'root',
  password: 'Ramaks316@@@Par',
});
