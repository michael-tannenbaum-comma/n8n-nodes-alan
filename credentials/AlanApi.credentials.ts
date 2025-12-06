import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AlanApi implements ICredentialType {
	name = 'alanApi';
	displayName = 'Alan API';
	documentationUrl = 'https://app.alan.de/docs';
	properties: INodeProperties[] = [
		{
			displayName: 'Auth Type',
			name: 'authType',
			type: 'options',
			options: [
				{
					name: 'Bearer Token (JWT)',
					value: 'bearer',
					description: 'Use for session tokens (Header: Authorization: Bearer ...)',
				},
				{
					name: 'API Key',
					value: 'apiKey',
					description: 'Use for generated API keys (Header: X-API-KEY: ...)',
				},
			],
			default: 'bearer',
		},
		{
			displayName: 'Key / Token',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Paste the key here WITHOUT "Bearer" prefix',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				// Wählt dynamisch den richtigen Header basierend auf deiner Auswahl
				Authorization: '={{$credentials.authType === "bearer" ? "Bearer " + $credentials.apiKey : undefined}}',
				'X-API-KEY': '={{$credentials.authType === "apiKey" ? $credentials.apiKey : undefined}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			// Wir nutzen die volle URL, um Probleme mit BaseURL Concatenation zu vermeiden
			url: 'https://app.alan.de/api/v1/user/',
			method: 'GET',
		},
	};
}