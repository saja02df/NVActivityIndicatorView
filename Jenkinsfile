#!/usr/bin/env groovy

pipeline {
    agent any

    environment {
        PATH = "${HOME}/.fastlane/bin:${PATH}"
        LC_ALL = 'en_US.UTF-8'
        EXPANDED_CODE_SIGN_IDENTITY = "-"
        EXPANDED_CODE_SIGN_IDENTITY_NAME="-"
    }

    parameters {
        booleanParam(defaultValue: true,
            description: 'Enable UI Test execution.',
            name: 'Execute_UI_Tests')


        booleanParam(defaultValue: false,
            description: 'Capture app screenshots',
            name: 'Capture_Screenshots')

    }

	options {
        timeout(time: 1,
        unit: 'HOURS')
    }

    stages {
        stage ('Checkout') {
            steps {
            echo "Flags: ${params.executeUITests}"
                echo env.PATH
                echo env.LC_ALL
                
                echo 'Deleting current workspace directory....'
                deleteDir()
                
                echo 'Initiating checkout...'
                checkout([$class: 'GitSCM',
                    branches: [[name: 'sj-cicid-test']],
                    doGenerateSubmoduleConfigurations: false, 
                    extensions: [[$class: 'CleanBeforeCheckout']], 
                    submoduleCfg: [], 
                    userRemoteConfigs: [[url: 'https://github.com/saja02df/NVActivityIndicatorView']]
                ])
            }

            post {
                success {
                    echo "********** ${env.STAGE_NAME} - Stage successful! **********"
                }
                failure {
                    echo "********** ${env.STAGE_NAME} - Stage Unsuccessful! **********"
                }
            }
        }

        stage('Dependecies') {

            steps {
                echo 'Fetching dependencies...'

                dir("Example") {
                    sh '/usr/local/bin/pod install --verbose'
                }
            }
            post {
                success {
                    echo "********** ${env.STAGE_NAME} - Stage successful! **********"
                }
                failure {
                    echo "********** ${env.STAGE_NAME} - Stage Unsuccessful! **********"
                }
            }
        }

        stage ('Build/Test') {

            steps {
                echo 'Starting build plus test...'
                sh 'env'
                sh 'xcodebuild \
                        -workspace "./Example/NVActivityIndicatorViewExample.xcworkspace" \
                        -scheme "NVActivityIndicatorViewTests" \
                        -configuration "Debug" \
                        build  \
                        test \
                        -derivedDataPath build/ \
                        -resultBundlePath results/ \
                        -destination "platform=iOS Simulator,name=iPhone XR,OS=12.1" \
                        -enableCodeCoverage YES \
                        CODE_SIGN_IDENTITY="" \
                        CODE_SIGNING_REQUIRED="NO" \
                        CODE_SIGN_ENTITLEMENTS="" \
                        CODE_SIGNING_ALLOWED="NO" \
                        | tee xcodebuild.log \
                        | /usr/local/bin/xcpretty -r junit'

                // Publish unit test restults...
                step([$class: 'JUnitResultArchiver',
                    allowEmptyResults: true,
                    testResults: 'build/reports/junit.xml'
                ])

                echo 'Extracting code coverage...'
                sh '/usr/local/bin/slather \
                    coverage \
                    --html \
                    --scheme NVActivityIndicatorViewTests \
                    --build-directory build \
                    --output-directory results/coverage \
                    --workspace Example/NVActivityIndicatorViewExample.xcworkspace \
                    Example/NVActivityIndicatorViewExample.xcodeproj'

                echo 'Publishing Code coverage report...'

                // Publish coverage results
                publishHTML([allowMissing: false, \
                            alwaysLinkToLastBuild: false, \
                            keepAll: false, \
                            reportDir: 'results/coverage', \
                            reportFiles: 'index.html', \
                            reportTitles: 'index.html', \
                            reportName: 'Coverage Report'])

            }
            post {
                success {
                    echo "********** ${env.STAGE_NAME} - Stage successful! **********"
                }
                failure {
                    echo "********** ${env.STAGE_NAME} - Stage Unsuccessful! **********"
                }
            }
        }

        stage ('UI_Tests') {

            when {
                expression { params.Execute_UI_Tests == true }
            }

            steps {
                echo 'Starting build plus UI Tests...'
                sh 'xcodebuild \
                        -workspace "./Example/NVActivityIndicatorViewExample.xcworkspace" \
                        -scheme "NVActivityIndicatorViewExampleUITests" \
                        -configuration "Debug" \
                        build  \
                        test \
                        -derivedDataPath build/ \
                        -resultBundlePath results_uitests/ \
                        -destination "platform=iOS Simulator,name=iPhone XR,OS=12.1" \
                        -enableCodeCoverage NO \
                        CODE_SIGN_IDENTITY="" \
                        CODE_SIGNING_REQUIRED="NO" \
                        CODE_SIGN_ENTITLEMENTS="" \
                        CODE_SIGNING_ALLOWED="NO" \
                        | /usr/local/bin/xcpretty -r junit'

                // Publish unit test restults...
                step([$class: 'JUnitResultArchiver',
                    allowEmptyResults: true,
                    testResults: 'build/reports/junit.xml'
                ])
            }

            post {
                success {
                    echo "********** ${env.STAGE_NAME} - Stage successful! **********"
                }
                failure {
                    echo "********** ${env.STAGE_NAME} - Stage Unsuccessful! **********"
                }
            }
        }

        stage('Automated Screenshots') {

            when {
                expression { params.Capture_Screenshots == true }
            }

            steps {
                echo 'Taking screenshots...'

                dir("Example") {
                    sh 'fastlane snapshot'
                }

                // Publish coverage results
                publishHTML([allowMissing: false, \
                    alwaysLinkToLastBuild: false, \
                    keepAll: false, \
                    reportDir: 'Example/fastlane-screenshots/', \
                    reportFiles: 'screenshots.html', \
                    reportTitles: 'screenshots.html', \
                    reportName: 'Screenshots'])
            }
            post {
                success {
                    echo "********** ${env.STAGE_NAME} - Stage successful! **********"
                }
                failure {
                    echo "********** ${env.STAGE_NAME} - Stage Unsuccessful! **********"
                }
            }
        }

        stage ('IPA Creation') {

            steps {
                echo 'Starting stage - ${env.STAGE_NAME} ...'

                sh 'xcodebuild archive \
                    -workspace "./Example/NVActivityIndicatorViewExample.xcworkspace" \
                    -scheme NVActivityIndicatorViewExample \
                    -archivePath ./Result.xcarchive'

                sh 'xcodebuild -exportArchive\
                    -archivePath ./Result.xcarchive \
                    -exportPath ./Result.ipa \
                    -exportOptionsPlist ./ExportOptions.plist'

            }
            post {
                success {
                    echo "********** ${env.STAGE_NAME} - Stage successful! **********"
                }
                failure {
                    echo "********** ${env.STAGE_NAME} - Stage Unsuccessful! **********"
                }
            }
        }
    }
}

