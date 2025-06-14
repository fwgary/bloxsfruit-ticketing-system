import Foundation

class APIClient {
    static let shared = APIClient()
    private let baseURL = URL(string: "http://localhost:3000/api")! // Change to your backend URL

    private var token: String? {
        didSet {
            if let token = token {
                UserDefaults.standard.set(token, forKey: "jwtToken")
            } else {
                UserDefaults.standard.removeObject(forKey: "jwtToken")
            }
        }
    }

    private init() {
        self.token = UserDefaults.standard.string(forKey: "jwtToken")
    }

    func login(discordId: String, completion: @escaping (Result<User, Error>) -> Void) {
        let url = baseURL.appendingPathComponent("login")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = ["discordId": discordId]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            guard let data = data else {
                completion(.failure(NSError(domain: "No data", code: -1)))
                return
            }
            do {
                let decoder = JSONDecoder()
                let loginResponse = try decoder.decode(LoginResponse.self, from: data)
                self.token = loginResponse.token
                completion(.success(loginResponse.user))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }

    func getUserProfile(completion: @escaping (Result<User, Error>) -> Void) {
        guard let token = token else {
            completion(.failure(NSError(domain: "No token", code: -1)))
            return
        }
        let url = baseURL.appendingPathComponent("me")
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            guard let data = data else {
                completion(.failure(NSError(domain: "No data", code: -1)))
                return
            }
            do {
                let decoder = JSONDecoder()
                let user = try decoder.decode(User.self, from: data)
                completion(.success(user))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }


    func getTickets(completion: @escaping (Result<[Ticket], Error>) -> Void) {
        guard let token = token else {
            completion(.failure(NSError(domain: "No token", code: -1)))
            return
        }
        let url = baseURL.appendingPathComponent("tickets")
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            guard let data = data else {
                completion(.failure(NSError(domain: "No data", code: -1)))
                return
            }
            do {
                let decoder = JSONDecoder()
                let tickets = try decoder.decode([Ticket].self, from: data)
                completion(.success(tickets))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
}

// MARK: - Models

struct LoginResponse: Codable {
    let token: String
    let user: User
}

struct User: Codable {
    let id: String
    let discordId: String
    let isStaff: Bool
    let isManager: Bool
    let username: String?
    let discriminator: String?
    let avatar: String?
}
