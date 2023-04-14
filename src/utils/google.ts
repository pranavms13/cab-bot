import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.googleActionsClientId);


export async function verify(token: string) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.googleActionsClientId,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload!['sub'];
    console.log(payload);
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
  }