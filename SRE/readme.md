 <!-- prometheus config and image running -->
docker compose up
<!-- graphana open source  -->
docker run -d -p 3100:3000 --name=grafana grafana/grafana-oss