export default {
    oidc : {
        clientId : '<Id>',
        issuer : 'https://<domain>/oauth2/default',
        redirectUri : 'https://localhost:4200/login/callback',
        scopes : ['openid', 'profile', 'email']
    }
}
