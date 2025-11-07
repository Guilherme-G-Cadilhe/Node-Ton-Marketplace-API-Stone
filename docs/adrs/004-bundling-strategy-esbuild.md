# ADR 004: Adoção do serverless-esbuild para Bundling

**Status:** Aceito

## Contexto

Durante a Fase de Deploy na AWS, o Serverless Framework falhou consistentemente no Windows com o erro `EMFILE: too many open files`.

A causa raiz foi o plugin padrão `serverless-plugin-typescript`, que não faz "bundling" verdadeiro. Em vez disso, ele compila os arquivos `.ts` para `.js` e tenta copiar _toda_ a árvore `node_modules` (incluindo `devDependencies`) para o pacote de deploy, estourando o limite de arquivos abertos do sistema operacional.

## Decisão

Substituímos o `serverless-plugin-typescript` pelo `serverless-esbuild`.

Esta decisão foi tomada após a falha de outras abordagens:

1.  `excludeDevDependencies: true` (Ignorado pelo plugin de TS).
2.  `include/exclude` manual (Frágil e complexo).
3.  `serverless-webpack` (Viável, mas mais lento e complexo de configurar).

## Consequências

- **✅ Prós:**
  - **Resolução do Bug:** O `esbuild` faz "tree-shaking" e empacota cada função e suas dependências reais em um _único arquivo .js_, eliminando o erro `EMFILE`.
  - **Performance de Deploy:** O tempo de compilação e empacotamento é drasticamente reduzido (de falhas em ~170s para um sucesso em 93s).
  - **Performance da Lambda:** Os pacotes de deploy ficaram minúsculos (ex: `authLogin` com 352kB), resultando em "cold starts" mais rápidos e menor custo de S3/Lambda.
  - **Simplicidade:** Configuração quase zero (`zero-config`).

- **❌ Contras:**
  - Nenhum. Esta é a melhor prática moderna para projetos Serverless com TypeScript.
