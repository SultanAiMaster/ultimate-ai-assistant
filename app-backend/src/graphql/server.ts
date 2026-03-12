import { ApolloServer } from '@apollo/server';
import { buildSchema } from 'type-graphql';
import { expressMiddleware } from '@apollo/server/express4';
import { SkillResolver } from './resolvers/SkillResolver';

/**
 * Create and configure Apollo Server
 */
export async function createApolloServer(): Promise<ApolloServer> {
  // Build GraphQL schema
  const schema = await buildSchema({
    resolvers: [SkillResolver],
    validate: true,
    emitSchemaFile: false
  });

  // Create Apollo Server
  const server = new ApolloServer({
    schema,
    introspection: true,
    csrfPrevention: false
  });

  return server;
}

/**
 * Apply GraphQL middleware to Express app
 */
export async function applyGraphQLMiddleware(
  app: any,
  path: string = '/graphql'
): Promise<void> {
  const server = await createApolloServer();

  await server.start();

  app.use(path, expressMiddleware(server, {
    context: async () => ({
      // Add context here (user, etc.)
    })
  }));

  console.log(`✅ GraphQL endpoint ready at ${path}`);
}
