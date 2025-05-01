docker-compose down
docker-compose up -d


lsof -i :5000
kill <pid>

docker build -t backend:latest .

kubectl delete all --all -n default

eval $(minikube docker-env)

eval $(minikube docker-env -u)

minikube image list

git restore --staged .



<!-- Loki -->
docker run -d --name=loki -p 3100:3100 grafana/loki

<!-- winston -->
npm install winston


<!-- docker port  -->
docker run -d -p 3100:3000 --name=grafana grafana/grafana-oss


docker run -d -p 5000:5000 --name=backend backend:latest


kubectl rollout restart deployment grafana



kubectl create configmap grafana-dashboards \
  --from-file=d1.json=./d1.json \
  --from-file=d2.json=./d2.json \
  --from-file=d3.json=./d3.json \
  --dry-run=client -o yaml > dashboards-configmap.yaml