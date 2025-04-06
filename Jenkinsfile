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
