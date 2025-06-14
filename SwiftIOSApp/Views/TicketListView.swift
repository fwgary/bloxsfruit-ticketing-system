import SwiftUI

struct TicketListView: View {
    @State private var tickets: [Ticket] = []
    @State private var isLoading = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationView {
            VStack {
                if isLoading {
                    ProgressView("Loading Tickets...")
                        .foregroundColor(.white)
                } else if let errorMessage = errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                } else {
                    List(tickets) { ticket in
                        NavigationLink(destination: TicketDetailView(ticket: ticket)) {
                            VStack(alignment: .leading) {
                                Text(ticket.subject)
                                    .font(.headline)
                                    .foregroundColor(.white)
                                Text("Category: \(ticket.category)")
                                    .font(.subheadline)
                                    .foregroundColor(.gray)
                                Text("Status: \(ticket.status ?? "Unknown")")
                                    .font(.subheadline)
                                    .foregroundColor(.gray)
                            }
                        }
                    }
                    .listStyle(PlainListStyle())
                }
            }
            .navigationTitle("My Tickets")
            .background(Color.black.edgesIgnoringSafeArea(.all))
            .onAppear(perform: fetchTickets)
        }
    }

    func fetchTickets() {
        isLoading = true
        errorMessage = nil
        APIClient.shared.getTickets { result in
            DispatchQueue.main.async {
                isLoading = false
                switch result {
                case .success(let fetchedTickets):
                    tickets = fetchedTickets.filter { $0.status != "Closed" }
                case .failure(let error):
                    errorMessage = error.localizedDescription
                }
            }
        }
    }
}

struct TicketListView_Previews: PreviewProvider {
    static var previews: some View {
        TicketListView()
    }
}
