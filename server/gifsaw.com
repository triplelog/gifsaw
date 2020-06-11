server {
	server_name gifsaw.com;
	location ~ /* {
			proxy_pass https://127.0.0.1:12312;
			proxy_http_version 1.1;
			proxy_set_header Upgrade $http_upgrade;
			proxy_set_header Connection "Upgrade";
	}



}