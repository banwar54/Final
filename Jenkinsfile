pipeline {
    agent any

    environment {
        REPO_URL = 'https://github.com/banwar54/Final.git'
        PROJECT_DIR = 'Mthree_Project'
    }

    stages {
        stage('Clone Repository') {
            steps {
                git url: "${REPO_URL}"
            }
        }

        stage('Build Docker Images') {
            steps {
                dir('Frontend') {
                    sh 'docker build -t frontend .'
                }
                dir('Backend') {
                    sh 'docker build -t backend .'
                }
            }
        }

        stage('Run Docker Compose') {
            steps {
                dir('SRE') {
                    sh 'docker-compose up -d'
                }
            }
        }

        stage('Start Minikube') {
            steps {
                sh '''
                minikube stop
                minikube start || echo "Minikube already running"
                '''
            }
        }

        stage('Load Images into Minikube') {
            steps {
                sh '''
                minikube image load prom/prometheus
                minikube image load grafana/loki
                minikube image load grafana/grafana
                minikube image load backend:latest
                minikube image load frontend:latest
                '''
            }
        }

        stage('Deploy Kubernetes Manifests') {
            steps {
                dir('SRE/K8') {
                    sh '''
                    kubectl apply -f prometheus.yaml
                    kubectl apply -f loki.yaml
                    kubectl apply -f grafana.yaml
                    kubectl apply -f hpa.yaml
                    kubectl apply -f backend.yaml
                    kubectl apply -f frontend.yaml
                    '''
                }
            }
        }

        stage('Port Forward Services') {
            steps {
                script {
                    // Forking background jobs manually (Jenkins doesn't like hanging scripts)
                    sh '''
                    nohup kubectl port-forward svc/prometheus 9090:9090 > /dev/null 2>&1 &
                    nohup kubectl port-forward svc/loki 3100:3100 > /dev/null 2>&1 &
                    nohup kubectl port-forward svc/grafana 3000:3000 > /dev/null 2>&1 &
                    nohup kubectl port-forward svc/quiz-backend 5000:5000 > /dev/null 2>&1 &
                    nohup kubectl port-forward svc/quiz-frontend 5174:5174 > /dev/null 2>&1 &
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '🎉 Deployment and monitoring setup successful!'
        }
        failure {
            echo '❌ Something went wrong. Check the logs.'
        }
    }
}
