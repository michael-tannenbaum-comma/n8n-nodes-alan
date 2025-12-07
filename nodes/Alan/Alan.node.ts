import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';

export class Alan implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Alan',
		name: 'alanLlm',
		icon: 'file:alan.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Interact with the Alan LLM Platform',
		defaults: {
			name: 'Alan',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'alanApi',
				required: true,
			},
		],
		properties: [
			// ----------------------------------
			// Resource Selection
			// ----------------------------------
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Chat', value: 'chat' },
					{ name: 'Expert', value: 'expert' },
					{ name: 'File', value: 'file' },
					{ name: 'Knowledge Base', value: 'knowledgeBase' },
				],
				default: 'chat',
			},

			// ----------------------------------
			// Resource: Chat
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['chat'] } },
				options: [
					{
						name: 'Create & Generate',
						value: 'create',
						description: 'Create a new chat and generate a response',
					},
				],
				default: 'create',
			},
			{
				displayName: 'Message',
				name: 'content',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['chat'], operation: ['create'] } },
				description: 'The user message to start the conversation with',
			},
			{
				displayName: 'Expert Name or ID',
				name: 'expertId',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getExperts' },
				default: '',
				displayOptions: { show: { resource: ['chat'], operation: ['create'] } },
				description: 'Choose an expert. If selected, expert settings (Prompt, Model, KBs) are loaded exclusively.',
			},
			{
				displayName: 'Knowledge Bases',
				name: 'knowledgeBaseIds',
				type: 'multiOptions',
				typeOptions: { loadOptionsMethod: 'getKnowledgeBases' },
				default: [],
				displayOptions: { 
					show: { 
						resource: ['chat'], 
						operation: ['create'],
						expertId: [''] 
					},
				},
				description: 'Select knowledge bases to use for RAG (Ignored if Expert is selected)',
			},
			{
				displayName: 'Attached Files (IDs)',
				name: 'attachedFiles',
				type: 'string',
				default: '',
				placeholder: 'UUID1, UUID2',
				displayOptions: { show: { resource: ['chat'], operation: ['create'] } },
				description: 'Comma-separated list of File IDs to attach to this message',
			},
			{
				displayName: 'System Abilities',
				name: 'systemAbilities',
				type: 'multiOptions',
				typeOptions: { loadOptionsMethod: 'getSystemAbilities' },
				default: [],
				displayOptions: { 
					show: { 
						resource: ['chat'], 
						operation: ['create'],
						expertId: ['']
					},
				},
				description: 'Abilities the chat allows (Ignored if Expert is selected)',
			},
			{
				displayName: 'API Only (Hide Chat)',
				name: 'apiOnly',
				type: 'boolean',
				default: true,
				displayOptions: { show: { resource: ['chat'], operation: ['create'] } },
				description: 'Whether the chat is hidden in the Alan UI history. Recommended "true" for automated workflows.',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getModels',
					creatable: true, // Allows manual input if model is missing in list
				},
				default: '',
				displayOptions: { show: { resource: ['chat'], operation: ['create'] } },
				description: 'Override the model. Leave empty to use Expert or Tenant default.',
			},
			{
				displayName: 'Options',
				name: 'chatOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: { show: { resource: ['chat'], operation: ['create'] } },
				options: [
					{
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						default: 0.7,
						typeOptions: { minValue: 0, maxValue: 1 },
					},
					{
						displayName: 'Top P',
						name: 'top_p',
						type: 'number',
						default: 0.95,
						typeOptions: { minValue: 0, maxValue: 1 },
					},
				],
			},

			// ----------------------------------
			// Resource: Expert
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['expert'] } },
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new expert',
					},
				],
				default: 'create',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['expert'], operation: ['create'] } },
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['expert'], operation: ['create'] } },
			},
			{
				displayName: 'System Prompt',
				name: 'systemPrompt',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				displayOptions: { show: { resource: ['expert'], operation: ['create'] } },
				description: 'Instructions for the expert (user_system_prompt)',
			},
			{
				displayName: 'Initial Message',
				name: 'initialMessage',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['expert'], operation: ['create'] } },
				description: 'Greeting message displayed to the user',
			},
			{
				displayName: 'Icon',
				name: 'icon',
				type: 'string',
				default: 'general',
				displayOptions: { show: { resource: ['expert'], operation: ['create'] } },
				description: 'Name of the icon (e.g. general, robot, questionmark)',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getModels',
					creatable: true,
				},
				default: '', 
				displayOptions: { show: { resource: ['expert'], operation: ['create'] } },
				description: 'The LLM model to use for this expert',
			},
			{
				displayName: 'Knowledge Bases',
				name: 'knowledgeBaseIds',
				type: 'multiOptions',
				typeOptions: { loadOptionsMethod: 'getKnowledgeBases' },
				default: [],
				displayOptions: { show: { resource: ['expert'], operation: ['create'] } },
				description: 'Knowledge bases attached to this expert',
			},
			{
				displayName: 'System Abilities',
				name: 'systemAbilities',
				type: 'multiOptions',
				typeOptions: { loadOptionsMethod: 'getSystemAbilities' },
				default: [],
				displayOptions: { show: { resource: ['expert'], operation: ['create'] } },
				description: 'Capabilities the expert can use',
			},
			{
				displayName: 'MCP Abilities',
				name: 'mcpAbilities',
				type: 'multiOptions',
				typeOptions: { loadOptionsMethod: 'getMcpAbilities' },
				default: [],
				displayOptions: { show: { resource: ['expert'], operation: ['create'] } },
				description: 'External tools (MCP) the expert can use',
			},
			{
				displayName: 'Suggestions',
				name: 'suggestions',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				displayOptions: { show: { resource: ['expert'], operation: ['create'] } },
				options: [
					{
						name: 'suggestionItems',
						displayName: 'Suggestion Items',
						values: [
							{
								displayName: 'Text',
								name: 'text',
								type: 'string',
								default: '',
								description: 'A suggestion chip text',
							},
						],
					},
				],
			},
			{
				displayName: 'Options',
				name: 'expertOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: { show: { resource: ['expert'], operation: ['create'] } },
				options: [
					{
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						default: 0.7,
						typeOptions: { minValue: 0, maxValue: 1 },
					},
					{
						displayName: 'Top P',
						name: 'top_p',
						type: 'number',
						default: 0.95,
						typeOptions: { minValue: 0, maxValue: 1 },
					},
				],
			},

			// ----------------------------------
			// Resource: File
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['file'] } },
				options: [
					{
						name: 'Upload',
						value: 'upload',
						description: 'Upload a file',
					},
				],
				default: 'upload',
			},
			{
				displayName: 'Input Binary Field',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: { show: { resource: ['file'], operation: ['upload'] } },
				description: 'The name of the binary key containing the file to upload',
			},

			// ----------------------------------
			// Resource: Knowledge Base
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['knowledgeBase'] } },
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new knowledge base',
					},
					{
						name: 'Add File to KB',
						value: 'addFile',
						description: 'Add an uploaded file to a knowledge base',
					},
				],
				default: 'create',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['knowledgeBase'], operation: ['create'] } },
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['knowledgeBase'], operation: ['create'] } },
			},
			{
				displayName: 'Connector',
				name: 'connectorId',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getConnectors' },
				default: '',
				required: true,
				displayOptions: { show: { resource: ['knowledgeBase'], operation: ['create'] } },
				description: 'The connector backing this knowledge base (usually Type "file")',
			},
			{
				displayName: 'Knowledge Base',
				name: 'knowledgeBaseId',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getKnowledgeBases' },
				default: '',
				required: true,
				displayOptions: { show: { resource: ['knowledgeBase'], operation: ['addFile'] } },
			},
			{
				displayName: 'File ID',
				name: 'fileId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['knowledgeBase'], operation: ['addFile'] } },
				description: 'The ID of the uploaded file (from the File -> Upload operation)',
			},
		],
	};

	methods = {
		loadOptions: {
			async getExperts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				
				returnData.push({
					name: '- No Expert -',
					value: '',
				});

				const responseData = await this.helpers.requestWithAuthentication.call(this, 'alanApi', {
					method: 'GET',
					url: 'https://app.alan.de/api/v1/experts/',
					json: true,
				});

				if (responseData.experts) {
					for (const expert of responseData.experts) {
						returnData.push({ name: expert.title, value: expert.resource_id });
					}
				}
				return returnData;
			},
			async getKnowledgeBases(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const responseData = await this.helpers.requestWithAuthentication.call(this, 'alanApi', {
					method: 'GET',
					url: 'https://app.alan.de/api/v1/connectors/knowledge-bases',
					json: true,
				});

				if (responseData.knowledge_bases) {
					for (const kb of responseData.knowledge_bases) {
						returnData.push({ name: kb.title, value: kb.resource_id });
					}
				}
				return returnData;
			},
			async getConnectors(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const responseData = await this.helpers.requestWithAuthentication.call(this, 'alanApi', {
					method: 'GET',
					url: 'https://app.alan.de/api/v1/connectors/',
					json: true,
				});

				if (responseData.connectors) {
					for (const conn of responseData.connectors) {
						returnData.push({ name: `${conn.title} (${conn.kind})`, value: conn.resource_id });
					}
				}
				return returnData;
			},
			async getSystemAbilities(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const responseData = await this.helpers.requestWithAuthentication.call(this, 'alanApi', {
					method: 'GET',
					url: 'https://app.alan.de/api/v1/abilities/system',
					json: true,
				});

				if (responseData.abilities) {
					for (const ability of responseData.abilities) {
						returnData.push({ name: ability.name, value: ability.name });
					}
				}
				return returnData;
			},
			async getMcpAbilities(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const responseData = await this.helpers.requestWithAuthentication.call(this, 'alanApi', {
					method: 'GET',
					url: 'https://app.alan.de/api/v1/abilities/mcp',
					json: true,
				});

				if (responseData.abilities) {
					for (const ability of responseData.abilities) {
						returnData.push({ name: ability.title, value: ability.resource_id });
					}
				}
				return returnData;
			},
			async getModels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				returnData.push({
					name: '- Default (Use Expert/System Settings) -',
					value: '',
				});

				const responseData = await this.helpers.requestWithAuthentication.call(this, 'alanApi', {
					method: 'GET',
					url: 'https://app.alan.de/api/v1/models/',
					json: true,
				});

				if (responseData.models) {
					for (const model of responseData.models) {
						returnData.push({ name: model.title, value: model.name });
					}
				}
				return returnData;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'chat' && operation === 'create') {
					// --- CHAT LOGIC ---
					const content = this.getNodeParameter('content', i) as string;
					const expertId = this.getNodeParameter('expertId', i) as string;
					const attachedFilesInput = this.getNodeParameter('attachedFiles', i) as string;
					const apiOnly = this.getNodeParameter('apiOnly', i) as boolean;
					const options = this.getNodeParameter('chatOptions', i) as IDataObject;
					
					let model = '';
					try {
						model = this.getNodeParameter('model', i) as string;
					} catch(e) { /* ignore if hidden */ }

					let attachedFiles: string[] = [];
					if (attachedFilesInput) {
						attachedFiles = attachedFilesInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
					}

					const body: IDataObject = {
						content,
						api_only: apiOnly,
						attached_files: attachedFiles,
					};

					if (expertId) {
						body.expert_id = expertId;
						body.load_expert_instead_of_settings = true;
						body.settings = {};
					} else {
						const knowledgeBaseIds = this.getNodeParameter('knowledgeBaseIds', i) as string[];
						const systemAbilities = this.getNodeParameter('systemAbilities', i) as string[];

						const settings: IDataObject = {
							knowledgebase_ids: knowledgeBaseIds || [],
							abilities_system: systemAbilities || [],
						};
						
						if (model) settings.model = model;
						if (options.temperature) settings.temperature = options.temperature;
						if (options.top_p) settings.top_p = options.top_p;

						body.settings = settings;
					}

					const response = await this.helpers.requestWithAuthentication.call(this, 'alanApi', {
						method: 'POST',
						url: 'https://app.alan.de/api/v1/chats/',
						body,
						json: false, 
					});

					// SSE Parser
					const rawString = response as string;
					const lines = rawString.split('\n');
					let finalMessage = null;
					let finalChat = null;

					for (const line of lines) {
						const trimmed = line.trim();
						if (trimmed.startsWith('data:')) {
							try {
								const jsonStr = trimmed.substring(5);
								const obj = JSON.parse(jsonStr);

								if (obj.kind === 'message' && obj.message && obj.message.role === 'assistant' && obj.message.state === 'Done') {
									finalMessage = obj.message;
								}
								if (obj.kind === 'chat') {
									finalChat = obj.chat;
								}
							} catch (e) { }
						}
					}

					if (finalMessage) {
						returnData.push({ json: finalMessage as IDataObject });
					} else if (finalChat) {
						returnData.push({ json: finalChat as IDataObject });
					} else {
						returnData.push({ json: { raw_response: rawString } });
					}
				}

				if (resource === 'expert' && operation === 'create') {
					// --- EXPERT CREATE ---
					const title = this.getNodeParameter('title', i) as string;
					const description = this.getNodeParameter('description', i) as string;
					const systemPrompt = this.getNodeParameter('systemPrompt', i) as string;
					const initialMessage = this.getNodeParameter('initialMessage', i) as string;
					const icon = this.getNodeParameter('icon', i) as string;
					const model = this.getNodeParameter('model', i) as string;
					const kbIds = this.getNodeParameter('knowledgeBaseIds', i) as string[];
					const abilities = this.getNodeParameter('systemAbilities', i) as string[];
					const mcpAbilities = this.getNodeParameter('mcpAbilities', i) as string[];
					const options = this.getNodeParameter('expertOptions', i) as IDataObject;
					
					// Suggestions Parsing
					const suggestionsCollection = this.getNodeParameter('suggestions', i) as IDataObject;
					let suggestionList: string[] = [];
					if (suggestionsCollection && suggestionsCollection.suggestionItems) {
						suggestionList = (suggestionsCollection.suggestionItems as IDataObject[]).map((item) => item.text as string);
					}

					const body = {
						title,
						description,
						settings: {
							icon: icon || 'general',
							model: model,
							user_system_prompt: systemPrompt,
							initial_message: initialMessage || null,
							initial_conversation: [],
							suggestions: suggestionList,
							knowledgebase_ids: kbIds || [],
							abilities_system: abilities || [],
							abilities_mcp: mcpAbilities || [],
							temperature: options.temperature ?? 0.7,
							top_p: options.top_p ?? 0.95,
						},
					};

					const response = await this.helpers.requestWithAuthentication.call(this, 'alanApi', {
						method: 'POST',
						url: 'https://app.alan.de/api/v1/experts/',
						body,
						json: true,
					});
					returnData.push({ json: response as IDataObject });
				}

				if (resource === 'file' && operation === 'upload') {
					// --- FILE UPLOAD ---
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
					const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
					const binaryBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

					const formData = {
						file: {
							value: binaryBuffer,
							options: {
								filename: binaryData.fileName || 'upload.txt',
								contentType: binaryData.mimeType || 'application/octet-stream',
							},
						},
					};

					const response = await this.helpers.requestWithAuthentication.call(this, 'alanApi', {
						method: 'POST',
						url: 'https://app.alan.de/api/v1/files/',
						formData, 
						json: false, 
					});
					const jsonResponse = typeof response === 'string' ? JSON.parse(response) : response;
					returnData.push({ json: jsonResponse as IDataObject });
				}

				if (resource === 'knowledgeBase' && operation === 'create') {
					// --- KB CREATE ---
					const title = this.getNodeParameter('title', i) as string;
					const description = this.getNodeParameter('description', i) as string;
					const connectorId = this.getNodeParameter('connectorId', i) as string;

					const body = {
						title,
						description: description || '',
						settings: {
							kind: 'file',
							files: [],
						},
					};

					const response = await this.helpers.requestWithAuthentication.call(this, 'alanApi', {
						method: 'POST',
						url: `https://app.alan.de/api/v1/connectors/${connectorId}/knowledge-bases`,
						body,
						json: true,
					});
					returnData.push({ json: response as IDataObject });
				}

				if (resource === 'knowledgeBase' && operation === 'addFile') {
					// --- ADD FILE TO KB ---
					const kbId = this.getNodeParameter('knowledgeBaseId', i) as string;
					const newFileId = this.getNodeParameter('fileId', i) as string;

					const allKbs = await this.helpers.requestWithAuthentication.call(this, 'alanApi', {
						method: 'GET',
						url: 'https://app.alan.de/api/v1/connectors/knowledge-bases',
						json: true,
					});

					const targetKb = (allKbs.knowledge_bases as any[]).find((kb) => kb.resource_id === kbId);

					if (!targetKb) {
						throw new Error(`Knowledge Base with ID ${kbId} not found.`);
					}

					const connectorId = targetKb.connector_id;
					const currentFiles = targetKb.settings?.files || [];

					if (currentFiles.includes(newFileId)) {
						returnData.push({ json: targetKb as IDataObject });
						continue;
					}

					const body = {
						title: targetKb.title,
						description: targetKb.description,
						settings: {
							kind: 'file',
							files: [...currentFiles, newFileId],
						},
					};

					const response = await this.helpers.requestWithAuthentication.call(this, 'alanApi', {
						method: 'PUT',
						url: `https://app.alan.de/api/v1/connectors/${connectorId}/knowledge-bases/${kbId}`,
						body,
						json: true,
					});
					returnData.push({ json: response as IDataObject });
				}

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}