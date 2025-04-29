pipeline {
     agent any

     environment {
       BUILD_NUM ="${BUILD_NUMBER}"
     }

     stages {

           stage('Generate Lighthouse Accessibility Report') {
              steps {
              // Generate Lighthouse Report
               sh 'npx lighthouse yusufasik.com --output=html --output-path=lighthouse-accessibility-report-${BUILD_NUMBER}.html --chrome-flags="--headless --no-sandbox --disable-gpu --disable-dev-shm-usage"'
              }
         }

           stage('Publish Lighthouse Accessibility Report') {
                steps {
                        publishHTML(target: [
                          allowMissing: false,
                          alwaysLinkToLastBuild: true,
                          keepAll: true,
                          reportDir: '.',
                          reportFiles: 'lighthouse-accessibility-report-${BUILD_NUMBER}.html',
                          reportName: 'Accessibility Report Build #${BUILD_NUMBER}'
                        ])
                }
         }

           stage('Archive Reports') {
            steps {
                // Lighthouse copy for zip
                sh 'zip -r lighthouse-report-${BUILD_NUMBER}.zip lighthouse-accessibility-report-${BUILD_NUMBER}.html'

                archiveArtifacts artifacts: 'allure-report.zip,lighthouse-report-${BUILD_NUMBER}.zip', allowEmptyArchive: false, onlyIfSuccessful: true
            }
        }
    }
       post {
         always {

             emailext (
                 to: 'contact@yusufasik.com',
                 subject: "Jenkins Build ${currentBuild.currentResult}: Job ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: '${DEFAULT_CONTENT}',
                 attachLog: true,
                 attachmentsPattern: 'lighthouse-report-${BUILD_NUMBER}.zip'
             )
         }
     }
}
