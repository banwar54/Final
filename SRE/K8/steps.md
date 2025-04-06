<!-- start minikube -->
minikube start

<!-- set context -->
docker use context default

<!-- apply deployment files -->
kubectl apply -f prometheus.yaml
kubectl apply -f loki.yaml
kubectl apply -f grafana.yaml
kubectl apply -f hpa.yaml
kubectl apply -f backend.yaml
kubectl apply -f frontend.yaml


<!-- loading images on minikube if issue occurs -->
minikube image load prom/prometheus
minikube image load grafana/loki
minikube image load grafana/grafana
minikube image load backend:latest
minikube image load frontend:latest



<!-- port forward kubernetes -->
kubectl port-forward svc/prometheus 9090:9090
kubectl port-forward svc/loki 3100:3100
kubectl port-forward svc/grafana 3000:3000
kubectl port-forward svc/quiz-backend 5000:5000
kubectl port-forward svc/quiz-frontend 5174:5174

<!-- check pod status on minikube dashboard -->
minikube dashboard