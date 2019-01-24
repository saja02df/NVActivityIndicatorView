#!/usr/bin/env groovy

pipeline {
    agent any

    environment {
        PATH = "${HOME}/.fastlane/bin:${PATH}"
        LC_ALL = 'en_US.UTF-8'
        EXPANDED_CODE_SIGN_IDENTITY = "-"
        EXPANDED_CODE_SIGN_IDENTITY_NAME="-"

        // Set the below environment variable property to point to the correct XCode version
        // Also, ensure the destination is selected as per the XCode version selected
        DEVELOPER_DIR="${HOME}/Home/Software/XCode/Xcode.app/Contents/Developer"

        // Credentials
        KEYCHAIN_PASSCODE = credentials('jenkins_sample_nvactivity_temp_keychain_passcode')
        PRIVATE_KEY_PASSCODE = credentials('jenkins_sample_nvactivity_private_key_passcode')
    }

    parameters {
        booleanParam(defaultValue: false,
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
                sh 'xcrun xcodebuild \
                        -workspace "./Example/NVActivityIndicatorViewExample.xcworkspace" \
                        -scheme "NVActivityIndicatorViewTests" \
                        -configuration "Debug" \
                        build  \
                        test \
                        -derivedDataPath build/ \
                        -resultBundlePath results/ \
                        -destination "platform=iOS Simulator,name=iPhone XR,OS=12.0" \
                        -enableCodeCoverage YES \
                        CODE_SIGN_IDENTITY="" \
                        CODE_SIGNING_REQUIRED="NO" \
                        CODE_SIGN_ENTITLEMENTS="" \
                        CODE_SIGNING_ALLOWED="NO" \
                        | tee xcodebuild.log \
                        | /usr/local/bin/xcpretty -r junit && exit ${PIPESTATUS[0]}'

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
                sh 'xcrun xcodebuild \
                        -workspace "./Example/NVActivityIndicatorViewExample.xcworkspace" \
                        -scheme "NVActivityIndicatorViewExampleUITests" \
                        -configuration "Debug" \
                        build  \
                        test \
                        -derivedDataPath build/ \
                        -resultBundlePath results_uitests/ \
                        -destination "platform=iOS Simulator,name=iPhone XR,OS=12.0" \
                        -enableCodeCoverage NO \
                        CODE_SIGN_IDENTITY="" \
                        CODE_SIGNING_REQUIRED="NO" \
                        CODE_SIGN_ENTITLEMENTS="" \
                        CODE_SIGNING_ALLOWED="NO" \
                        | /usr/local/bin/xcpretty -r junit && exit ${PIPESTATUS[0]}'

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

                echo 'Initiating checkout for code signing entities...'

                // Checkout signing entities repo
                checkout([$class: 'GitSCM',
                    branches: [[name: 'master']],
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [[$class: 'RelativeTargetDirectory', relativeTargetDir: 'SigningEntities']],
                    submoduleCfg: [],
                    userRemoteConfigs: [[url: 'https://github.com/saja02df/MyTestRepo.git']]])

                // Setup up siginig certificate and provisioning profile.
                dir("SigningEntities/CICD_NVAvtivity") {

                    // Decrypt provisioning profile
                    sh 'openssl enc -aes-256-cbc -d -a -in 3eb34f9b-e17a-4403-85c8-82337390bf7b.enc.mobileprovision -out 3eb34f9b-e17a-4403-85c8-82337390bf7b.mobileprovision -k 112233'

                    // Decrypt certificate
                    sh 'openssl enc -aes-256-cbc -d -a -in DevCertSampleNVActivity.enc.p12 -out DevCertSampleNVActivity.p12 -k 112233'

                    // Create temporary keychain
                    sh "security create-keychain -p $KEYCHAIN_PASSCODE SigningEntities"

                    // Unlock temporary keychain
                    sh "security unlock-keychain -p $KEYCHAIN_PASSCODE SigningEntities"

                    // Make temporary keychain visible
                    sh 'security list-keychains -s SigningEntities'

                    // Import certificate to keychain
                    sh 'security import DevCertSampleNVActivity.p12 -P $PRIVATE_KEY_PASSCODE -k SigningEntities -T /usr/bin/codesign -T /usr/bin/security'

                    // If we do not do this step, we see a UI permission dislog from Codesign to allow using keychain entities.
                    // See - https://stackoverflow.com/questions/39868578/security-codesign-in-sierra-keychain-ignores-access-control-settings-and-ui-p
                    sh "security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k $KEYCHAIN_PASSCODE SigningEntities"

                    // Copy provisioning profile to the right directory
                    sh "cp 3eb34f9b-e17a-4403-85c8-82337390bf7b.mobileprovision ~/Library/MobileDevice/Provisioning\\ Profiles/3eb34f9b-e17a-4403-85c8-82337390bf7b.mobileprovision"
                }


                // Archive build
                sh 'xcrun xcodebuild archive \
                    -workspace "./Example/NVActivityIndicatorViewExample.xcworkspace" \
                    -scheme NVActivityIndicatorViewExample \
                    -archivePath ./Result.xcarchive'

                // Create IPA
                sh 'xcrun xcodebuild -exportArchive\
                    -archivePath ./Result.xcarchive \
                    -exportPath ./BuildArtifacts \
                    -exportOptionsPlist ./ExportOptions.plist'

                // Delete the temporary keychain
                sh 'security delete-keychain SigningEntities'

                // Delete mobile provisioning profile
                sh "rm ~/Library/MobileDevice/Provisioning\\ Profiles/3eb34f9b-e17a-4403-85c8-82337390bf7b.mobileprovision"

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

