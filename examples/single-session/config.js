const config = {
  settings: {
    status: {
      online: { name: 'online', title: 'Online', cssClass: 'online' },
      offline: { name: 'offline', title: 'Offline', cssClass: 'offline' },
      connecting: { name: 'connecting', title: 'Connecting', cssClass: 'connecting' }
    },
    machineId: "example-ws",
    socket: {
      url: "http://localhost:3500/",
      eventContext: "reversebytes.beat.client",
      contextType: "client-action",
      contextChannel: "ws"
    },
    selectors: [
      { name: 'createAgentBtn', domSelector: '.create-agent' },
      { name: 'createClientBtn', domSelector: '.create-client' },
      { name: 'qrVisorImg', domSelector: '.qr-visor' },
      { name: 'qrDoneImg', domSelector: '.qr-done' },
      { name: 'logsContainer', domSelector: '.logs-container' },
      { name: 'status', domSelector: '.status' },
      { name: 'statusDot', domSelector: '.status .dot' },
      { name: 'statusText', domSelector: '.status .text' }
    ]
  },
  user: {
    id: "usr-001",
    apps: [
      {
        "name": "nlp-engine",
        "title": "NLP Engine",
        "version": "0.0.0.1",
        "isActive": true,
        "settings": {
          "serviceUrl": "https://ivc-cognitive-services-dev.cognitiveservices.azure.com/luis/prediction/v3.0/apps/a1622828-4a53-4e0f-8464-1f2d5ef92789/slots/production/predict",
          "serviceMethod": "GET",
          "serviceParameters": "?verbose=true&show-all-intents=true&log=true&subscription-key=3cfde4a20a7546038627e4e2a1885057&query=",
          "provider": "azure",
          "metadata": {
            "threshold": "0.15",
          },
          "isEnabled": true
        }
      },
      {
        "name": "dropbox",
        "title": "Dropbox",
        "version": "0.0.0.1",
        "isActive": true,
        "settings": {

        }
      }
    ],
    bots: [
      {
        "id": "bot-001",
        "name": "Inversiones Von Croften - Welcome",
        "behavior": "flow",
        "platform": "whatsapp",
        "isDefault": true,
        "triggers": [
          {
            "id": "trigger-001",
            "name": "",
            "title": "",
            "isDefault": true,
            "condition": {
              "inputType": "starting-point",
              "key": ""
            },
            "then": {
              "scope": "internal",
              "service": "actions",
              "botId": "bot-001",
              "actionId": "start"
            }
          },
          {
            "id": "trigger-002",
            "name": "",
            "title": "",
            "isDefault": true,
            "condition": {
              "inputType": "exact-match",
              "key": "#welcome"
            },
            "then": {
              "scope": "internal",
              "service": "actions",
              "botId": "bot-001",
              "actionId": "start"
            }
          }
        ],
        "actions": [
          {
            "id": "start",
            "messages": [
              {
                "body": "Bienvenido a *Inversiones Von Croften*",
                "behavior": "simple"
              },
              {
                "body": "Selecciona una opción:\n\n1) Solicitud de propuesta (RFP)\n2) Legal\n3) Agendar cita\n4) Proyectos\n5) Echo",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "option-number",
            "intents": [
              {
                "key": "1",
                "scope": "external",
                "service": "bot",
                "botId": "bot-002",
                "actionId": "start"
              },
              {
                "key": "2",
                "scope": "external",
                "service": "bot",
                "botId": "bot-004",
                "actionId": "start"
              },
              {
                "key": "3",
                "scope": "external",
                "service": "bot",
                "botId": "bot-011",
                "actionId": "start"
              },
              {
                "key": "4",
                "scope": "external",
                "service": "bot",
                "botId": "bot-003",
                "actionId": "start"
              },
              {
                "key": "5",
                "scope": "external",
                "service": "bot",
                "botId": "bot-005",
                "actionId": "start"
              }
            ]
          }
        ]
      },
      {
        "id": "bot-002",
        "name": "Inversiones Von Croften - RFP",
        "behavior": "flow",
        "platform": "whatsapp",
        "triggers": [
          {
            "id": "trigger-001",
            "name": "",
            "title": "",
            "isDefault": true,
            "condition": {
              "inputType": "exact-match",
              "key": "#rfp"
            },
            "then": {
              "scope": "internal",
              "service": "actions",
              "actionId": "start",
              "botId": "bot-002"
            }
          }
        ],
        "actions": [
          {
            "id": "start",
            "messages": [
              {
                "body": "Entendemos que tienes una necesidad única y especial, por ello vamos a crear una solicitud y la atenderemos lo más pronto posible",
                "behavior": "simple"
              },
              {
                "body": "Para iniciar escribe tu email:",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-005",
                "actionId": "intent-0"
              }
            ]
          },
          {
            "id": "intent-0",
            "messages": [
              {
                "body": "Ahora, escribe al detalle qué necesitas:",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-002",
                "actionId": "eoi-success"
              }
            ]
          },
          {
            "id": "eoi-success",
            "messages": [
              {
                "body": "Gracias, estaremos comunicandonos contigo brindandote información y acompañamiento.",
                "behavior": "simple"
              },
              {
                "body": "Para continuar escribe algo.",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "external",
                "service": "bot",
                "botId": "bot-001",
                "actionId": "start"
              }
            ]
          },
          {
            "id": "eoi-failed",
            "messages": [
              {
                "body": "Gracias, Si necesitas algo más de nosotros puedes volver a escribirnos.",
                "behavior": "simple"
              },
              {
                "body": "Para continuar escribe algo.",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "external",
                "service": "bot",
                "botId": "bot-001",
                "actionId": "start"
              }
            ]
          }
        ]
      },
      {
        "id": "bot-003",
        "name": "Inversiones Von Croften - Projects",
        "behavior": "flow",
        "platform": "whatsapp",
        "triggers": [
          {
            "id": "trigger-001",
            "name": "",
            "title": "",
            "isDefault": true,
            "condition": {
              "inputType": "exact-match",
              "key": "#ivc-proj"
            },
            "then": {
              "scope": "internal",
              "service": "actions",
              "actionId": "start",
              "botId": "bot-003"
            }
          }
        ],
        "actions": [
          {
            "id": "start",
            "messages": [
              {
                "body": "Somos una incubadora de negocios y por ello, queremos que conozcas cada proyecto relevante para nosotros",
                "behavior": "simple"
              },
              {
                "body": "Selecciona una opción:\n\n1) Virtual capital of America\n2) Mi Retail\n3) Go Bot\n4) Salir",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "option-number",
            "intents": [
              {
                "key": "1",
                "scope": "external",
                "service": "bot",
                "botId": "bot-006",
                "actionId": "start"
              },
              {
                "key": "2",
                "scope": "external",
                "service": "bot",
                "botId": "bot-012",
                "actionId": "start"
              },
              {
                "key": "3",
                "scope": "external",
                "service": "bot",
                "botId": "bot-008",
                "actionId": "start"
              },
              {
                "key": "4",
                "scope": "external",
                "service": "bot",
                "botId": "bot-001",
                "actionId": "start"
              }
            ]
          },
          {
            "id": "eoi-success",
            "messages": [
              {
                "body": "Gracias, estaremos comunicandonos contigo brindandote información y acompañamiento.",
                "behavior": "simple"
              },
              {
                "body": "Para continuar escribe algo.",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "external",
                "service": "bot",
                "botId": "bot-001",
                "actionId": "start"
              }
            ]
          },
          {
            "id": "eoi-failed",
            "messages": [
              {
                "body": "No he entendido tu respuesta, por favor sigue las instrucciones correctamente.",
                "behavior": "simple"
              },
              {
                "body": "Para continuar escribe algo.",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "internal",
                "service": "bot",
                "botId": "bot-003",
                "actionId": "start"
              }
            ]
          }
        ]
      },
      {
        "id": "bot-004",
        "name": "Inversiones Von Croften - Legal",
        "behavior": "flow",
        "platform": "whatsapp",
        "triggers": [
          {
            "id": "trigger-001",
            "name": "exact-match",
            "title": "Exact match string IVC Legal",
            "isDefault": true,
            "condition": {
              "inputType": "exact-match",
              "key": "#ivc-legal"
            },
            "then": {
              "scope": "internal",
              "service": "actions",
              "actionId": "start",
              "botId": "bot-004"
            }
          }
        ],
        "actions": [
          {
            "id": "start",
            "messages": [
              {
                "body": "Entendemos que necesitas información más estructurada, para continuar, sigue el siguiente enlace:",
                "behavior": "simple"
              },
              {
                "body": "https://www.dremind.com/us/about",
                "behavior": "simple"
              },
              {
                "body": "Si ya visitaste el sitio, cómo más podemos ayudarte?",
                "behavior": "simple"
              },
              {
                "body": "Para continuar escribe algo.",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "external",
                "service": "bot",
                "botId": "bot-001",
                "actionId": "start"
              }
            ]
          }
        ]
      },
      {
        "id": "bot-011",
        "name": "Inversiones Von Croften - Schedule",
        "behavior": "flow",
        "platform": "whatsapp",
        "triggers": [
          {
            "id": "trigger-001",
            "name": "exact-match",
            "title": "Exact match string IVC Schedule",
            "isDefault": true,
            "condition": {
              "inputType": "exact-match",
              "key": "#ivc-schedule"
            },
            "then": {
              "scope": "internal",
              "service": "actions",
              "actionId": "start",
              "botId": "bot-011"
            }
          }
        ],
        "actions": [
          {
            "id": "start",
            "messages": [
              {
                "body": "Siempre estamos disponibles para ti, por eso queremos que confirmes una cita con nosotros en el siguiente enlace:",
                "behavior": "simple"
              },
              {
                "body": "https://calendly.com/camiepisode/30min",
                "behavior": "simple"
              },
              {
                "body": "Si ya agendaste la llamada, cómo más podemos ayudarte?",
                "behavior": "simple"
              },
              {
                "body": "Para continuar escribe algo.",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "external",
                "service": "bot",
                "botId": "bot-001",
                "actionId": "start"
              }
            ]
          }
        ]
      },
      {
        "id": "bot-005",
        "name": "Inversiones Von Croften - Echo",
        "behavior": "flow",
        "platform": "whatsapp",
        "triggers": [
          {
            "id": "trigger-001",
            "name": "exact-match",
            "title": "Exact match string IVC Echo",
            "isDefault": true,
            "condition": {
              "inputType": "exact-match",
              "key": "#echo"
            },
            "then": {
              "scope": "internal",
              "service": "actions",
              "actionId": "start",
              "botId": "bot-005"
            }
          }
        ],
        "actions": [
          {
            "id": "start",
            "messages": [
              {
                "body": "Tu mensaje: _{{INCOMING_MESSAGE}}_",
                "behavior": "reply"
              },
              {
                "body": "Para salir escribe _#welcome_",
                "behavior": "simple"
              },
              {
                "body": "Escribeme algo...",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-005",
                "actionId": "start"
              }
            ]
          }
        ]
      },
      {
        "id": "bot-006",
        "name": "Virtual capital of America - Menu",
        "behavior": "flow",
        "platform": "whatsapp",
        "triggers": [
          {
            "id": "trigger-001",
            "name": "exact-match",
            "title": "Exact match string VCA Menu",
            "isDefault": true,
            "condition": {
              "inputType": "exact-match",
              "key": "#vca"
            },
            "then": {
              "scope": "internal",
              "service": "actions",
              "actionId": "start",
              "botId": "bot-006"
            }
          }
        ],
        "actions": [
          {
            "id": "start",
            "messages": [
              {
                "body": "Bienvenido a *Virtual capital of America*",
                "behavior": "simple"
              },
              {
                "body": "Selecciona una opción:\n\n1) Activar cuenta\n2) Crear cuenta\n3) Conoce más\n4) Salir",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "option-number",
            "intents": [
              {
                "key": "1",
                "scope": "external",
                "service": "bot",
                "botId": "bot-007",
                "actionId": "start"
              },
              {
                "key": "2",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-006",
                "actionId": "intent-0"
              },
              {
                "key": "3",
                "scope": "external",
                "service": "bot",
                "botId": "bot-006",
                "actionId": "intent-1"
              },
              {
                "key": "4",
                "scope": "external",
                "service": "bot",
                "botId": "bot-003",
                "actionId": "start"
              }
            ]
          },
          {
            "id": "intent-0",
            "messages": [
              {
                "body": "Para crear una cuenta dirigete a la siguiente dirección:",
                "behavior": "simple"
              },
              {
                "body": "https://app.virtualcapitalofamerica.com/signup/",
                "behavior": "simple"
              },
              {
                "body": "Para continuar escribe algo.",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-006",
                "actionId": "start"
              }
            ]
          },
          {
            "id": "intent-1",
            "messages": [
              {
                "body": "VCA es una fintech que revoluciona el sector financiero con novedosas tecnologías y servicios",
                "behavior": "simple"
              },
              {
                "body": "https://www.virtualcapitalofamerica.com",
                "behavior": "simple"
              },
              {
                "body": "https://www.virtualcapitalofamerica.com/img/OpenGraphBanner.jpg",
                "behavior": "image"
              },
              {
                "body": "Para continuar escribe algo.",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-006",
                "actionId": "start"
              }
            ]
          },
          {
            "id": "eoi-success",
            "messages": [
              {
                "body": "Gracias, estamos junto a ti.",
                "behavior": "simple"
              },
              {
                "body": "Para continuar escribe algo.",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "external",
                "service": "bot",
                "botId": "bot-003",
                "actionId": "start"
              }
            ]
          },
          {
            "id": "eoi-failed",
            "messages": [
              {
                "body": "Gracias, Si necesitas algo más de nosotros puedes volver a escribirnos.",
                "behavior": "simple"
              },
              {
                "body": "Para continuar escribe algo.",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "external",
                "service": "bot",
                "botId": "bot-001",
                "actionId": "start"
              }
            ]
          }
        ]
      },
      {
        "id": "bot-007",
        "name": "Virtual capital of America - Account activation",
        "behavior": "flow",
        "platform": "whatsapp",
        "triggers": [
          {
            "id": "trigger-001",
            "name": "exact-match",
            "title": "Exact match string VCA Account Activation",
            "isDefault": true,
            "condition": {
              "inputType": "exact-match",
              "key": "#vca-activation"
            },
            "then": {
              "scope": "internal",
              "service": "actions",
              "actionId": "start",
              "botId": "bot-007"
            }
          }
        ],
        "actions": [
          {
            "id": "start",
            "messages": [
              {
                "body": "Hi!, welcome to *Virtual capital of America* activation",
                "behavior": "simple"
              },
              {
                "body": "Your account with associate phone number _{{INCOMING_PHONE}}_ has been activated.",
                "behavior": "simple"
              },
              {
                "body": "Please visit https://www.virtualcapitalofamerica.com to go to online banking",
                "behavior": "simple"
              },
              {
                "body": "Do you have any other request?",
                "behavior": "simple"
              }
            ],
            "webhooks": {
              "preflight": {
                "route": "http://api.virtualcapitalofamerica.com/api/validate-account-chatbot",
                "method": "POST"
              },
              "callback": {
                "route": "http://www.virtualcapitalofamerica.com/api/chatbot",
                "method": "get"
              }
            },
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "external",
                "service": "bot",
                "botId": "bot-006",
                "actionId": "start"
              }
            ]
          }
        ]
      },
      {
        "id": "bot-008",
        "name": "Go Bot - Menu",
        "behavior": "flow",
        "platform": "whatsapp",
        "triggers": [
          {
            "id": "trigger-001",
            "name": "exact-match",
            "title": "Exact match string Go Bot Menu",
            "isDefault": true,
            "condition": {
              "inputType": "exact-match",
              "key": "#gobot"
            },
            "then": {
              "scope": "internal",
              "service": "actions",
              "actionId": "start",
              "botId": "bot-008"
            }
          }
        ],
        "actions": [
          {
            "id": "start",
            "messages": [
              {
                "body": "Bienvenido a *Go Bot*",
                "behavior": "simple"
              },
              {
                "body": "Selecciona una opción:\n\n1) Activar cuenta\n2) Crear cuenta\n3) Conoce más\n4) Salir",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "option-number",
            "intents": [
              {
                "key": "1",
                "scope": "external",
                "service": "bot",
                "botId": "bot-009",
                "actionId": "start"
              },
              {
                "key": "2",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-008",
                "actionId": "intent-0"
              },
              {
                "key": "3",
                "scope": "external",
                "service": "bot",
                "botId": "bot-008",
                "actionId": "intent-1"
              },
              {
                "key": "4",
                "scope": "external",
                "service": "bot",
                "botId": "bot-003",
                "actionId": "start"
              }
            ]
          },
          {
            "id": "intent-0",
            "messages": [
              {
                "body": "Para crear una cuenta dirigete a la siguiente dirección:",
                "behavior": "simple"
              },
              {
                "body": "https://app.gobot.site/signup/",
                "behavior": "simple"
              },
              {
                "body": "Para continuar escribe algo.",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-008",
                "actionId": "start"
              }
            ]
          },
          {
            "id": "intent-1",
            "messages": [
              {
                "body": "Go Bot es una tecnología que potencia tus canales de comunicación para que seas una empresa omnicanal",
                "behavior": "simple"
              },
              {
                "body": "https://www.gobot.site",
                "behavior": "simple"
              },
              {
                "body": "https://www.gobot.site/img/OpenGraphBanner.jpg",
                "behavior": "image"
              },
              {
                "body": "Para continuar escribe algo.",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-008",
                "actionId": "start"
              }
            ]
          },
          {
            "id": "eoi-success",
            "messages": [
              {
                "body": "Gracias, Go Bot está junto a ti.",
                "behavior": "simple"
              },
              {
                "body": "Para continuar escribe algo.",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "external",
                "service": "bot",
                "botId": "bot-001",
                "actionId": "start"
              }
            ]
          },
          {
            "id": "eoi-failed",
            "messages": [
              {
                "body": "Gracias, Si necesitas algo más de nosotros puedes volver a escribirnos.",
                "behavior": "simple"
              },
              {
                "body": "Para continuar escribe algo.",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "external",
                "service": "bot",
                "botId": "bot-001",
                "actionId": "start"
              }
            ]
          }
        ]
      },
      {
        "id": "bot-009",
        "name": "Go Bot - Account activation",
        "behavior": "flow",
        "platform": "whatsapp",
        "triggers": [
          {
            "id": "trigger-001",
            "name": "exact-match",
            "title": "Exact match string Go Bot Account Activation",
            "isDefault": true,
            "condition": {
              "inputType": "exact-match",
              "key": "#gobot-activation"
            },
            "then": {
              "scope": "internal",
              "service": "actions",
              "actionId": "start",
              "botId": "bot-009"
            }
          }
        ],
        "actions": [
          {
            "id": "start",
            "messages": [
              {
                "body": "Hi!, welcome to *Go Bot* activation",
                "behavior": "simple"
              },
              {
                "body": "Your account with associate phone number _{{INCOMING_PHONE}}_ has been activated.",
                "behavior": "simple"
              },
              {
                "body": "Please visit https://www.gobot.site to configure your bots",
                "behavior": "simple"
              },
              {
                "body": "Do you have any other request?",
                "behavior": "simple"
              }
            ],
            "webhooks": {
              "preflight": {
                "route": "http://api.gobot.site/api/validate-account-chatbot",
                "method": "POST"
              },
              "callback": {
                "route": "http://www.gobot.site/api/chatbot",
                "method": "POST"
              }
            },
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "external",
                "service": "bot",
                "botId": "bot-008",
                "actionId": "start"
              }
            ]
          }
        ]
      },
      {
        "id": "bot-010",
        "name": "Covid Bot",
        "behavior": "flow",
        "platform": "whatsapp",
        "triggers": [
          {
            "id": "trigger-001",
            "name": "exact-match",
            "title": "Exact match string Covid",
            "isDefault": true,
            "condition": {
              "inputType": "exact-match",
              "key": "#covid"
            },
            "then": {
              "scope": "internal",
              "service": "actions",
              "actionId": "start",
              "botId": "bot-010"
            }
          }
        ],
        "actions": [
          {
            "id": "start",
            "messages": [],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-010",
                "actionId": "intent-0"
              }
            ]
          },
          {
            "id": "intent-0",
            "messages": [
              {
                "body": "Hola!, soy *Covid Bot*,",
                "behavior": "simple"
              },
              {
                "body": "Me gustaría ayudarte a idenficar si tienes algunos sintomas de COVID-19 para prevenir posibles riesgos",
                "behavior": "simple"
              },
              {
                "body": "Estas de acuerdo?",
                "behavior": "simple"
              },
              {
                "body": "Responde *SI* o *NO*",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "option-string",
            "intents": [
              {
                "key": "SI",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-005",
                "actionId": "intent-1"
              },
              {
                "key": "NO",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-005",
                "actionId": "eoi-failed"
              },
              {
                "key": "YES",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-005",
                "actionId": "intent-1"
              }
            ]
          },
          {
            "id": "intent-1",
            "messages": [
              {
                "body": "Escribe tu número de documento de identidad (sin puntos, ni simbolos especiales), a continuación:",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any-number",
            "intents": [
              {
                "key": "",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-005",
                "actionId": "intent-2"
              }
            ]
          },
          {
            "id": "intent-2",
            "messages": [
              {
                "body": "En los ultimos dias has tenido gripa?",
                "behavior": "simple"
              },
              {
                "body": "Responde *SI* o *NO*",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "option-string",
            "intents": [
              {
                "key": "SI",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-005",
                "actionId": "intent-3"
              },
              {
                "key": "NO",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-005",
                "actionId": "intent-6"
              },
              {
                "key": "YES",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-005",
                "actionId": "intent-3"
              }
            ]
          },
          {
            "id": "intent-3",
            "messages": [
              {
                "body": "La gripa estuvo acompañada de sintomas como:",
                "behavior": "simple"
              },
              {
                "body": "- Dolor de cabeza,",
                "behavior": "simple"
              },
              {
                "body": "- Perdida del olfato,",
                "behavior": "simple"
              },
              {
                "body": "- Dolores musculares,",
                "behavior": "simple"
              },
              {
                "body": "- Tos,",
                "behavior": "simple"
              },
              {
                "body": "- Dolor de garganta,",
                "behavior": "simple"
              },
              {
                "body": "- Dolor en el pecho?",
                "behavior": "simple"
              },
              {
                "body": "Responde *SI* si has presentado alguno de los sintomas anteriores o *NO* si no los has presentado",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "option-string",
            "intents": [
              {
                "key": "SI",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-005",
                "actionId": "intent-4"
              },
              {
                "key": "NO",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-005",
                "actionId": "no-end"
              },
              {
                "key": "YES",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-005",
                "actionId": "intent-4"
              }
            ]
          },
          {
            "id": "intent-7",
            "messages": [
              {
                "body": "Ademas de estos síntomas has sentido fatiga?",
                "behavior": "simple"
              },
              {
                "body": "Responde *SI* o *NO*",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "option-string",
            "intents": [
              {
                "key": "SI",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-005",
                "actionId": "eoi-success"
              },
              {
                "key": "NO",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-005",
                "actionId": "eoi-success"
              },
              {
                "key": "YES",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-005",
                "actionId": "eoi-success"
              }
            ]
          },
          {
            "id": "eoi-success",
            "messages": [
              {
                "body": "Gracias, estaremos comunicandonos contigo brindandote información y acompañamiento.",
                "behavior": "simple"
              },
              {
                "body": "Para continuar escribe algo.",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-005",
                "actionId": "start"
              }
            ]
          },
          {
            "id": "eoi-failed",
            "messages": [
              {
                "body": "Gracias, estaremos comunicandonos contigo brindandote información y acompañamiento.",
                "behavior": "simple"
              },
              {
                "body": "Para continuar escribe algo.",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-005",
                "actionId": "start"
              }
            ]
          },
          {
            "id": "no-end",
            "messages": [
              {
                "body": "Gracias, estaremos junto a ti brindandote información y acompañamiento.",
                "behavior": "simple"
              },
              {
                "body": "Lávate las manos con frecuencia",
                "behavior": "simple"
              },
              {
                "body": "No saludes a la gente con besos o apretones de mano",
                "behavior": "simple"
              },
              {
                "body": "Si toses, cúbrete la boca con el codo flexionado o con un pañuelo desechable",
                "behavior": "simple"
              },
              {
                "body": "Evita tocarte los ojos, la nariz y la boca",
                "behavior": "simple"
              },
              {
                "body": "Si tienes fiebre o dificultad para respirar, busca atención médica, pero llama primero a la línea 123",
                "behavior": "simple"
              },
              {
                "body": "Sigue las indicaciones de las autoridades locales y nacionale",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-005",
                "actionId": "start"
              }
            ]
          },
          {
            "id": "no-key",
            "messages": [
              {
                "body": "No entiendo tu respuesta, revisa qué información te solicité",
                "behavior": "simple"
              }
            ],
            "webhooks": {
              "preflight": null,
              "callback": null
            }
          }
        ]
      },
      {
        "id": "bot-012",
        "name": "Mi Retail - Menu",
        "behavior": "flow",
        "platform": "whatsapp",
        "triggers": [
          {
            "id": "trigger-001",
            "name": "exact-match",
            "title": "Exact match string Mi Retail Menu",
            "isDefault": true,
            "condition": {
              "inputType": "exact-match",
              "key": "#miretail"
            },
            "then": {
              "scope": "internal",
              "service": "actions",
              "actionId": "start",
              "botId": "bot-012"
            }
          }
        ],
        "actions": [
          {
            "id": "start",
            "messages": [
              {
                "body": "Bienvenido a *Mi Retail*",
                "behavior": "simple"
              },
              {
                "body": "Selecciona una opción:\n\n1) Activar cuenta\n2) Crear cuenta\n3) Conoce más\n4) Salir",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "option-number",
            "intents": [
              {
                "key": "1",
                "scope": "external",
                "service": "bot",
                "botId": "bot-013",
                "actionId": "start"
              },
              {
                "key": "2",
                "scope": "internal",
                "service": "actions",
                "actionId": "intent-0",
                "botId": "bot-012"
              },
              {
                "key": "3",
                "scope": "internal",
                "service": "actions",
                "actionId": "intent-1",
                "botId": "bot-012"
              },
              {
                "key": "4",
                "scope": "external",
                "service": "bot",
                "botId": "bot-003",
                "actionId": "start"
              }
            ]
          },
          {
            "id": "intent-0",
            "messages": [
              {
                "body": "Para crear una cuenta dirigete a la siguiente dirección:",
                "behavior": "simple"
              },
              {
                "body": "https://app.miretail.com.co/signup/",
                "behavior": "simple"
              },
              {
                "body": "Para continuar escribe algo.",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-012",
                "actionId": "start"
              }
            ]
          },
          {
            "id": "intent-1",
            "messages": [
              {
                "body": "Mi Retail es el ecosistema para tu negocio donde encontrarás todo lo que necesites",
                "behavior": "simple"
              },
              {
                "body": "https://www.miretail.com.co",
                "behavior": "simple"
              },
              {
                "body": "https://www.miretail.com.co/img/OpenGraphBanner.jpg",
                "behavior": "image"
              },
              {
                "body": "Para continuar escribe algo.",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "internal",
                "service": "actions",
                "botId": "bot-012",
                "actionId": "start"
              }
            ]
          },
          {
            "id": "eoi-success",
            "messages": [
              {
                "body": "Gracias, Mi Retail está junto a ti.",
                "behavior": "simple"
              },
              {
                "body": "Para continuar escribe algo.",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "external",
                "service": "bot",
                "botId": "bot-003",
                "actionId": "start"
              }
            ]
          },
          {
            "id": "eoi-failed",
            "messages": [
              {
                "body": "Gracias, Si necesitas algo más de nosotros puedes volver a escribirnos.",
                "behavior": "simple"
              },
              {
                "body": "Para continuar escribe algo.",
                "behavior": "simple"
              }
            ],
            "webhooks": [
              { "uri": "" }
            ],
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "external",
                "service": "bot",
                "botId": "bot-001",
                "actionId": "start"
              }
            ]
          }
        ]
      },
      {
        "id": "bot-013",
        "name": "Mi Retail - Account activation",
        "behavior": "flow",
        "platform": "whatsapp",
        "triggers": [
          {
            "id": "trigger-001",
            "name": "exact-match",
            "title": "Exact match string Mi Retail Account Activation",
            "isDefault": true,
            "condition": {
              "inputType": "exact-match",
              "key": "#miretail-activation"
            },
            "then": {
              "scope": "internal",
              "service": "actions",
              "actionId": "start",
              "botId": "bot-013"
            }
          }
        ],
        "actions": [
          {
            "id": "start",
            "messages": [
              {
                "body": "Hi!, welcome to *Mi Retail* activation",
                "behavior": "simple"
              },
              {
                "body": "Your account with associate phone number _{{INCOMING_PHONE}}_ has been activated.",
                "behavior": "simple"
              },
              {
                "body": "Please visit https://www.miretail.com.co to open your store",
                "behavior": "simple"
              },
              {
                "body": "Do you have any other request?",
                "behavior": "simple"
              }
            ],
            "webhooks": {
              "preflight": {
                "route": "http://api.miretail.com.co/api/validate-account-chatbot",
                "method": "POST"
              },
              "callback": {
                "route": "http://www.miretail.com.co/api/chatbot",
                "method": "POST"
              }
            },
            "inputType": "any",
            "intents": [
              {
                "key": "",
                "scope": "external",
                "service": "bot",
                "botId": "bot-012",
                "actionId": "start"
              }
            ]
          }
        ]
      }
    ],
    settings: {
      max_qr_attempts: 10
    }
  }
}

const global = {
  status: {},
  socket: {},
  selectors: {},
  isCreatedAgent: false,
  isCreatedClient: false,
  logs: []
}

export { config, global }
