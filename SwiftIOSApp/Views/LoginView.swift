import SwiftUI

struct LoginView: View {
    @State private var discordId: String = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var user: User?

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("Login")
                    .font(.largeTitle)
                    .bold()
                    .foregroundColor(.white)

                TextField("Enter Discord ID", text: $discordId)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding()
                    .background(Color.gray.opacity(0.2))
                    .cornerRadius(8)
                    .foregroundColor(.white)
                    .autocapitalization(.none)

                if let errorMessage = errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                }

                if isLoading {
                    ProgressView()
                } else {
                    Button(action: login) {
                        Text("Login")
                            .foregroundColor(.white)
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(Color.black)
                            .cornerRadius(8)
                    }
                    .disabled(discordId.isEmpty)
                }
            }
            .padding()
            .background(Color.black.edgesIgnoringSafeArea(.all))
            .navigationBarHidden(true)
        }
    }

    func login() {
        isLoading = true
        errorMessage = nil
        APIClient.shared.login(discordId: discordId) { result in
            DispatchQueue.main.async {
                isLoading = false
                switch result {
                case .success(let loggedInUser):
                    user = loggedInUser
                    // TODO: Navigate to dashboard or main app view
                case .failure(let error):
                    errorMessage = error.localizedDescription
                }
            }
        }
    }
}

struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView()
    }
}
