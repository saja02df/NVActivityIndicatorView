//
//  NVActivityIndicatorViewExampleUITests.swift
//  NVActivityIndicatorViewExampleUITests
//
//  Created by Saurabh Jain on 06/01/19.
//  Copyright © 2019 Vinh Nguyen. All rights reserved.
//

import XCTest

class NVActivityIndicatorViewExampleUITests: XCTestCase {

    override func setUp() {
        // Put setup code here. This method is called before the invocation of each test method in the class.

        let app = XCUIApplication()
        
        // Setup fastlane for taking screenshots
        setupSnapshot(app)
        
        // In UI tests it is usually best to stop immediately when a failure occurs.
        continueAfterFailure = false

        // UI tests must launch the application that they test. Doing this in setup will make sure it happens for each test method.
        app.launch()

        // In UI tests it’s important to set the initial state - such as interface orientation - required for your tests before they run. The setUp method is a good place to do this.
    }

    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    func testExample() {
        
        let app = XCUIApplication()
        
        snapshot("01_Home")
        
        let elementsQuery = app.otherElements.containing(.staticText, identifier:"0")
        elementsQuery.children(matching: .button).element(boundBy: 14).tap()

        snapshot("01_Home_Loading")

        let loadingIndicator:XCUIElement = app.staticTexts["Loading..."]
        XCTAssertTrue(loadingIndicator.waitForExistence(timeout: 5.0))
        
        let authIndicator:XCUIElement = app.staticTexts["Authenticating..."]
        XCTAssertTrue(authIndicator.waitForExistence(timeout: 5.0))

        snapshot("01_Home_Authenticating")

        print(app.debugDescription)
    }
}
