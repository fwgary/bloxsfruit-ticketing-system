import SwiftUI

struct TicketDetailView: View {
    @State var ticket: Ticket
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var status: String
    @State private var subject: String
    @State private var description: String

    init(ticket: Ticket) {
        self._ticket = State(initialValue: ticket)
        self._status = State(initialValue: ticket.status ?? "")
        self._subject = State(initialValue: ticket.subject)
        self._description = State(initialValue: ticket.description ?? "")
    }

    var body: some View {
        Form {
            Section(header: Text("Subject")) {
                TextField("Subject", text: $subject)
            }
            Section(header: Text("Description")) {
                TextEditor(text: $description)
                    .frame(height: 150)
            }
            Section(header: Text("Status")) {
                Picker("Status", selection: $status) {
                    Text("Open").tag("Open")
                    Text("In Progress").tag("In Progress")
                    Text("Closed").tag("Closed")
                }
                .pickerStyle(SegmentedPickerStyle())
            }
            if let errorMessage = errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
            }
            Button(action: updateTicket) {
                if isLoading {
                    ProgressView()
                } else {
                    Text("Update Ticket")
                        .frame(maxWidth: .infinity)
                }
            }
        }
        .navigationTitle("Ticket Details")
        .navigationBarTitleDisplayMode(.inline)
    }

    func updateTicket() {
        isLoading = true
        errorMessage = nil
        var updatedTicket = ticket
        updatedTicket.status = status
        updatedTicket.subject = subject
        updatedTicket.description = description

        APIClient.shared.updateTicket(ticket: updatedTicket) { result in
            DispatchQueue.main.async {
                isLoading = false
                switch result {
                case .success(let ticket):
                    self.ticket = ticket
                case .failure(let error):
                    errorMessage = error.localizedDescription
                }
            }
        }
    }
}

struct TicketDetailView_Previews: PreviewProvider {
    static var previews: some View {
        let sampleTicket = Ticket(id: "1", userId: "user1", platform: "Discord", category: "Bug Report", subject: "Sample Ticket", description: "Description here", status: "Open", assignedTo: nil)
        TicketDetailView(ticket: sampleTicket)
    }
}
