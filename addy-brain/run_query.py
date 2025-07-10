from app.SupervisorAgent import ask_addy

while True:
    query = input(">>\nAsk Addy (e.g., 'give me a sarcastic rogue'): ")
    if query.lower() in ["exit", "quit"]:
        break
    response = ask_addy(query)  # This uses routing + memory + debug logging
    print("\nAddy says:\n" + response["addy"])
    # Optionally, print debug info:
    # print("\n[DEBUG]\n", response["debug"])
