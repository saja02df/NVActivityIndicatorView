import UIKit

//Refer to this link:
//https://medium.com/@nimjea/json-parsing-in-swift-2498099b78f

struct User: Codable{
    var userId: Int
    var id: Int
    var title: String
    var completed: Bool
}

extension User {
    //Custom Keys
    enum CodingKeys: String, CodingKey {
        case userId
        case id = "serviceId"  //Custom keys
        case title = "titleKey" //Custom keys
        case completed
    }
}

print("Hello World!")

var jsonString:String = "{\"userId\":1,\"serviceId\":1,\"titleKey\":\"delectus aut autem\",\"completed\":false}"

let jsonData:Data?  = jsonString.data(using: .utf8)

do {
    //here dataResponse received from a network request
    let decoder = JSONDecoder()
    let model = try decoder.decode(User.self, from:
        jsonData!) //Decode JSON Response Data
    print(model)
} catch let parsingError {
    print("Error", parsingError)
}

