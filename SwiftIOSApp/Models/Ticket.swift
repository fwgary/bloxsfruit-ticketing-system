import Foundation

struct Ticket: Codable, Identifiable {
    let id: String
    let userId: String
    var platform: String?
    var category: String
    var subject: String
    var description: String?
    var status: String?
    var assignedTo: String?

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case userId
        case platform
        case category
        case subject
        case description
        case status
        case assignedTo
    }
}
