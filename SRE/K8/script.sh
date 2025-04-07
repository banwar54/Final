#!/bin/bash

set -e

echo "Minikube..."
minikube start

echo "Applying yaml files..."
kubectl apply -f prometheus.yaml
kubectl apply -f loki.yaml
kubectl apply -f grafana.yaml
kubectl apply -f dashboards-configmap.yaml
kubectl apply -f hpa.yaml
kubectl apply -f backend.yaml
kubectl apply -f frontend.yaml

echo "Loading images into Minikube..."
minikube image load prom/prometheus
minikube image load grafana/loki
minikube image load grafana/grafana
minikube image load backend:latest
minikube image load frontend:latest

echo "waiting for containers"
kubectl wait --for=condition=ready pod --all --timeout=180s

echo "Opening Minikube dashboard"
minikube dashboard &

echo "port forwards..."

nohup kubectl port-forward svc/prometheus 9090:9090 > /dev/null 2>&1 &
nohup kubectl port-forward svc/loki 3100:3100 > /dev/null 2>&1 &
nohup kubectl port-forward svc/grafana 3000:3000 > /dev/null 2>&1 &
nohup kubectl port-forward svc/quiz-backend 5000:5000 > /dev/null 2>&1 &
nohup kubectl port-forward svc/quiz-frontend 5174:5174 > /dev/null 2>&1 &

echo "Good to Go"
