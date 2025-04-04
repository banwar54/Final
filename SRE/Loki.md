<!-- Loki -->
docker run -d --name=loki -p 3100:3100 grafana/loki

<!-- winston -->
npm install winston winston-loki

