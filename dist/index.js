const deprecate = require('util');
const RecuperacaoSenha = require('./mixins/recuperacao-senha');

export default deprecate(
  app => app.loopback.modelBuilder.mixins.define('RecuperacaoSenha', RecuperacaoSenha),
  'DEPRECATED: Use mixinSources, see https://github.com/jonathan-casarrubias/loopback-import-mixin#mixinsources'
);