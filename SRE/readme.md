 <!-- prometheus config and image running -->
docker compose up
<!-- graphana open source  -->
docker run -d -p 3000:3000 --name=grafana grafana/grafana-oss