'use strict';
const debug = (valor) => {
  //console.log(`log`, valor)
};
const warn = (options, message) => {
  if (!options.silenceWarnings) {
    console.warn(message);
  }
};

module.exports = (Model, bootOptions = {}) => {
  debug(`RecuperacaoSenha mixin para o Model ${Model.modelName}`);

  const options = Object.assign({
    ChaveSenha: 'ChaveSenha',
    ChaveSenhaToken: 'ChaveSenhaToken',
    emailModel: "Email",
    senderAddress: "naoresponda@mydrug.com.br",
    subject: 'MyDrug - Chave de alteração da senha',
    html: `Sua chave para resetar a senha é: <b>{chave}</b>. Use essa chave para resetar a sua senha.`,
    silenceWarnings: false,
  }, bootOptions);

  debug('options', options);

  //Define as propriedades
  Model.defineProperty(options.ChaveSenha, {
    type: 'string',
    required: false,
  });

  Model.defineProperty(options.ChaveSenhaToken, {
    type: 'string',
    required: false,
  });

  //Funções
  Model.criaChave = () => {
    var text = "";
    var possible = "0123456789";
    for (var i = 0; i < 6; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text.substring(0, 3) + '-' + text.substring(3);
  }

  //Eventos
  Model.on('resetPasswordRequest', (info) => {
    //Vou adicionar no model uma chave aleatoria
    let chave = Model.criaChave();

    Model.upsertWithWhere({
      id: info.user.id
    }, {
      ChaveSenha: chave,
      ChaveSenhaToken: info.accessToken.id
    }, (err, obj) => {

      if (!err) {

        var html = options.html.replace("{chave}", chave);

        Model.app.models[options.emailModel].send({
          to: info.email,
          from: options.senderAddress,
          subject: options.subject,
          html: html
        }, (err) => {
          if (err) return debug('> erro enviar chave por email', err);
          debug('> enviado a chave de recuperação da senha  para o email:', info.email);
        });
      }
    });

  });

  //Remote Metods
  Model.chaveReucperacaoSenha = (email, chave, next) => {

    Model.find({
      fields: {
        ChaveSenhaToken: true
      },
      where: {
        email: email,
        ChaveSenha: chave
      }
    }, (err, data) => {
      if (data.length)
        next(null, {
          ChaveSenhaToken: data[0].ChaveSenhaToken
        });
      else
        next('Chave não vinculada para esse email', {});
    });
  }

  Model.remoteMethod('chaveReucperacaoSenha', {
    http: {
      path: '/reset-token',
      verb: 'post'
    },
    description: '',
    accepts: [{
        arg: 'email',
        type: 'string',
        http: {
          source: 'form'
        },
        required: true
      },
      {
        arg: 'chave',
        type: 'string',
        http: {
          source: 'form'
        },
        required: true
      },
      // { arg: 'ctx', type: 'object', http: { source: 'context' } },
    ],
    returns: {
      arg: 'status',
      type: 'string',
      root: true
    }
  });

  // Define a ACL de acesso
  Model.on('attached', function (server) {
    var ACL = server.models.ACL;
    ACL.findOrCreate({
      model: Model.modelName,
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: '$everyone',
      permission: 'ALLOW',
      property: 'chaveReucperacaoSenha'
    }, function (err, acl) {
      //console.log('ACL entry created: %j', acl);
    });
  });

};
