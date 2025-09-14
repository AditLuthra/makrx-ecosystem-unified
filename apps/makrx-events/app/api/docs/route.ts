import { NextResponse } from 'next/server';

const API_DOCUMENTATION = {
  openapi: '3.0.0',
  info: {
    title: 'MakrX.events API',
    version: '1.0.0',
    description: 'Event management platform API for maker events and technical festivals',
    contact: {
      name: 'MakrX.events Support',
      email: 'support@makrx.events',
      url: 'https://makrx.events'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000',
      description: 'Development server'
    }
  ],
  paths: {
    '/api/health': {
      get: {
        summary: 'Health check endpoint',
        description: 'Returns the health status of the application and its services',
        tags: ['System'],
        responses: {
          200: {
            description: 'Application is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    timestamp: { type: 'string', format: 'date-time' },
                    database: { type: 'string', example: 'connected' },
                    services: {
                      type: 'object',
                      properties: {
                        websocket: { type: 'string', example: 'active' },
                        email: { type: 'string', example: 'configured' },
                        payments: { type: 'string', example: 'configured' },
                        auth: { type: 'string', example: 'configured' }
                      }
                    }
                  }
                }
              }
            }
          },
          503: {
            description: 'Application is unhealthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'unhealthy' },
                    error: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/user': {
      get: {
        summary: 'Get current user',
        description: 'Returns the currently authenticated user information',
        tags: ['Authentication'],
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Current user information',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    profileImageUrl: { type: 'string', nullable: true },
                    role: { type: 'string', enum: ['user', 'event_admin', 'super_admin'] },
                    status: { type: 'string', enum: ['active', 'pending', 'suspended'] }
                  }
                }
              }
            }
          },
          401: { description: 'Authentication required' }
        }
      }
    },
    '/api/events': {
      get: {
        summary: 'List events',
        description: 'Get a list of events with optional filtering',
        tags: ['Events'],
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['upcoming', 'past', 'live'] },
            description: 'Filter events by status'
          },
          {
            name: 'type',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter events by type'
          },
          {
            name: 'location',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter events by location'
          }
        ],
        responses: {
          200: {
            description: 'List of events',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      title: { type: 'string' },
                      description: { type: 'string' },
                      location: { type: 'string' },
                      startDate: { type: 'string', format: 'date-time' },
                      endDate: { type: 'string', format: 'date-time' },
                      registrationFee: { type: 'string' },
                      maxAttendees: { type: 'integer' },
                      status: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create event',
        description: 'Create a new event',
        tags: ['Events'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'startDate', 'endDate'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  location: { type: 'string' },
                  startDate: { type: 'string', format: 'date-time' },
                  endDate: { type: 'string', format: 'date-time' },
                  registrationFee: { type: 'string' },
                  maxAttendees: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Event created successfully' },
          400: { description: 'Invalid input data' },
          401: { description: 'Authentication required' }
        }
      }
    },
    '/api/my-registrations': {
      get: {
        summary: 'Get user registrations',
        description: 'Get all event registrations for the current user',
        tags: ['Registrations'],
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'User registrations',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      type: { type: 'string' },
                      status: { type: 'string' },
                      registeredAt: { type: 'string', format: 'date-time' },
                      event: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          title: { type: 'string' },
                          startDate: { type: 'string', format: 'date-time' },
                          location: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { description: 'Authentication required' }
        }
      }
    },
    '/api/platform-stats': {
      get: {
        summary: 'Platform statistics',
        description: 'Get platform-wide statistics and metrics',
        tags: ['Analytics'],
        responses: {
          200: {
            description: 'Platform statistics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    activeEvents: { type: 'string' },
                    globalCities: { type: 'string' },
                    registeredMakers: { type: 'string' },
                    totalWorkshops: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/featured-events': {
      get: {
        summary: 'Featured events',
        description: 'Get a list of featured events for the homepage',
        tags: ['Events'],
        responses: {
          200: {
            description: 'Featured events',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      title: { type: 'string' },
                      shortDescription: { type: 'string' },
                      location: { type: 'string' },
                      startDate: { type: 'string', format: 'date-time' },
                      endDate: { type: 'string', format: 'date-time' },
                      price: { type: 'string' },
                      featuredImage: { type: 'string' },
                      registrations: { type: 'integer' },
                      type: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Keycloak JWT token'
      }
    }
  },
  tags: [
    { name: 'System', description: 'System health and monitoring' },
    { name: 'Authentication', description: 'User authentication and authorization' },
    { name: 'Events', description: 'Event management operations' },
    { name: 'Registrations', description: 'Event registration management' },
    { name: 'Analytics', description: 'Platform analytics and statistics' }
  ]
};

export async function GET() {
  return NextResponse.json(API_DOCUMENTATION);
}