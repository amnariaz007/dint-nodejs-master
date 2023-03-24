1. Create a new file .env.local and add all the env variables.
2. To whitelist the IP, put IP to the validIps array under app.json
3. To call the API (/api/send-dint/:apiKey), we must need to pass api security key with it. SECURITY_KEY is in the env folder. 
4. The env folder need to have OWNER_PRIVATE_KEY to call this API.
5. While calling the parameter, we must need to send this parameter: {
    "sender_id": int,
    "reciever_id":int,
    "amount": int
}
