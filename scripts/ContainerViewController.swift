import UIKit

class ContainerViewController: UIViewController {
  
  enum SlideOutState {
    case bothCollapsed
    case leftPanelExpanded
  }
  
  var centerNavigationController: UINavigationController!
  var centerViewController: UIViewController!
  var leftViewController: UIViewController?
  let centerPanelExpandedOffset: CGFloat = 90

  var currentState: SlideOutState = .bothCollapsed {
    didSet {
      let shouldShowShadow = currentState != .bothCollapsed
      showShadowForCenterViewController(shouldShowShadow)
    }
  }
  
  convenience init(leftVC: UIViewController, centerVC:UIViewController) {
    self.init()
    self.leftViewController = leftVC
    self.centerViewController = centerVC
    
    self.addLeftPanelViewController()
    self.addSideMenuButton()
  }

  override func viewDidLoad() {
    super.viewDidLoad()
    
    // wrap the centerViewController in a navigation controller, so we can push views to it
    // and display bar button items in the navigation bar
    centerNavigationController = UINavigationController(rootViewController: centerViewController)
    view.addSubview(centerNavigationController.view)
    addChild(centerNavigationController)
    
    centerNavigationController.didMove(toParent: self)
    
    // Add shadow
    centerNavigationController.view.layer.shadowColor = UIColor.darkGray.cgColor
    centerNavigationController.view.clipsToBounds = false
    centerNavigationController.view.layer.shadowOpacity = 0.7
    centerNavigationController.view.layer.shadowRadius = 10

    
    let panGestureRecognizer = UIPanGestureRecognizer(target: self, action: #selector(handlePanGesture(_:)))
    centerNavigationController.view.addGestureRecognizer(panGestureRecognizer)
  }
  
  private func addLeftPanelViewController() {
    guard let leftViewController = leftViewController else { return }
    
    addChildSidePanelController(leftViewController)
  }
  
  private func animateLeftPanel(shouldExpand: Bool) {
    if shouldExpand {
      currentState = .leftPanelExpanded
      animateCenterPanelXPosition(
        targetPosition: centerNavigationController.view.frame.width - centerPanelExpandedOffset)
    } else {
      animateCenterPanelXPosition(targetPosition: 0) { _ in
        self.currentState = .bothCollapsed
      }
    }
  }
  
  private func animateCenterPanelXPosition(targetPosition: CGFloat, completion: ((Bool) -> Void)? = nil) {
    UIView.animate(withDuration: 0.5,
                   delay: 0,
                   usingSpringWithDamping: 0.8,
                   initialSpringVelocity: 0,
                   options: .curveEaseInOut, animations: {
                    self.centerNavigationController.view.frame.origin.x = targetPosition
    }, completion: completion)
  }
  
  private func addChildSidePanelController(_ sidePanelController: UIViewController) {
    view.insertSubview(sidePanelController.view, at: 0)
    
    addChild(sidePanelController)
    sidePanelController.didMove(toParent: self)
  }
  
  private func showShadowForCenterViewController(_ shouldShowShadow: Bool) {
    if shouldShowShadow {
      centerNavigationController.view.layer.shadowOpacity = 0.8
    } else {
      centerNavigationController.view.layer.shadowOpacity = 0.0
    }
  }
}

// MARK: ContainerViewControllerDelegate
extension ContainerViewController: ContainerViewControllerDelegate {
  
  func toggleLeftPanel() {
    let notAlreadyExpanded = (currentState != .leftPanelExpanded)

    animateLeftPanel(shouldExpand: notAlreadyExpanded)
  }
  
  func collapseSidePanels() {
    switch currentState {
    case .leftPanelExpanded:
      toggleLeftPanel()
    default:
      break
    }
  }
  
  func replaceRootVC(vc:UIViewController) {
    self.centerNavigationController.viewControllers = [vc]
    self.addSideMenuButton()
  }
}

// MARK: Add buttons to View Controller
extension ContainerViewController {
  
  public func addSideMenuButton(completion: ((UIButton) -> ())? = nil) {
    let image = UIImage.init(named: "menu")
    let button = UIButton(frame: CGRect(x: 0,
                                        y: 0,
                                        width: 30,
                                        height: 30))
    
    button.setImage(image,
                    for: .normal)
    button.addTarget(self, action: #selector(toggle),
                     for: UIControl.Event.touchUpInside)
    
      let newItems = computeNewItems(button: button,
                                     controller: centerNavigationController.topViewController)
      centerNavigationController.topViewController?.navigationItem.leftBarButtonItems = newItems
    
    completion?(button)
  }
  
  private func computeNewItems(button: UIButton,
                               controller: UIViewController?) -> [UIBarButtonItem] {
    
    let items: [UIBarButtonItem] = centerNavigationController.topViewController?.navigationItem.leftBarButtonItems ?? []
    
    for item in items {
      if let button = item.customView as? UIButton,
        button.allTargets.contains(self) {
        return items
      }
    }
    
    let item:UIBarButtonItem = UIBarButtonItem()
    item.customView = button
    
    let spacer = UIBarButtonItem(barButtonSystemItem: UIBarButtonItem.SystemItem.fixedSpace,
                                 target: nil,
                                 action: nil)
    spacer.width = -10
    var finalItems = [item, spacer]
    finalItems.append(contentsOf: items)
    
    return finalItems
  }
  
  @objc func toggle() {
    self.toggleLeftPanel()
  }
}

// MARK: Gesture recognizer
extension ContainerViewController: UIGestureRecognizerDelegate {
  @objc func handlePanGesture(_ recognizer: UIPanGestureRecognizer) {

    switch recognizer.state {
    case .began:
      if currentState == .bothCollapsed {
        
        showShadowForCenterViewController(true)
      }
      
    case .changed:
      if let rview = recognizer.view {
        rview.center.x = rview.center.x + recognizer.translation(in: view).x
        recognizer.setTranslation(CGPoint.zero, in: view)
      }
      
    case .ended:
      if let _ = leftViewController,
        let rview = recognizer.view {
        // animate the side panel open or closed based on whether the view
        // has moved more or less than halfway
        let hasMovedGreaterThanHalfway = rview.center.x > view.bounds.size.width
        animateLeftPanel(shouldExpand: hasMovedGreaterThanHalfway)
      }
      
    default:
      break
    }
  }
}
