[![NPM](https://nodei.co/npm/@hedsdesign/loopback-recuperacao-senha-mixin.png?stars&downloads)](https://nodei.co/npm/@hedsdesign/loopback-recuperacao-senha-mixin/)

Loopback Recuperação de Senha Mixin
=============
Este módulo foi projetado para o framework [Strongloop Loopback](https://github.com/strongloop/loopback). Ele fornece funcionalidade de recuperação de senha com métodos mas fácil para integração com angular2+.
De um modo geral ele gera uma chave com seis números que é enviada para o email do usuário que ele pode usála pra recuperar o token de curta duração para enfim alterar a senha. 
Ele cria duas propriedades na tabela para armazenamento da chave e o token temporário e um método `api/model/reset-token` e já dá a permissão da ACL para o acesso a esse método, porque por padrão no model baseado no `User` possui todos os metódos bloqueados excetos alguns como o de login, logout, etc.

#### INSTALAÇÃO

```bash
  npm install --save @hedsdesign/loopback-recuperacao-senha-mixin
```

#### ADICIONANDO MIXIN
Com [loopback-boot@v2.8.0](https://github.com/strongloop/loopback-boot/) [mixinSources](https://github.com/strongloop/loopback-boot/pull/131) foram implementado de forma que permita carregar este mixin sem alterações no arquivo `server.js` previamente requerido.

Adicione as propriedade e `mixins` e a tabela de log no arquivo `server/model-config.json` como a seguir:

```js
{
  "_meta": {
    "sources": [
     ...
    ],
    "mixins": [
     ...
      "../node_modules/@hedsdesign/loopback-recuperacao-senha-mixin/dist/mixins"      
    ]
  },
  ...
  "Email": {
    "dataSource": "emailDs"
  }
}
```

E configure com os dados do seu servidor de email SMTP no arquivo `datasources.json` como no exemplo

```js
{
  "emailDs": {
    "name": "emailDs",
    "connector": "mail",
    "transports": [
      {
        "type": "smtp",
        "host": "smtp.gmail.com",
        "secure": true,
        "port": 465,
        "tls": {
          "rejectUnauthorized": false
        },
        "auth": {
          "user": "naoresponda@gmail.com",
          "pass": "suasenha"
        }
      }
    ]
  }
}
```


IMPORTANDO O MIXIN
========

Você apenas deverá adicionar o mixin a sua tabela (model)  como o exemplo:

```js
"mixins": {
    "RecuperacaoSenha": true   
  }
```

ou ajustando apenas propriedades principais:

```js
"mixins": {
   "RecuperacaoSenha": {       
        "senderAddress": "naoresponda@seusite.com.br",
        "subject": "Seu Aplicativo - Chave de alteração da senha",
        "html": "Sua chave para resetar a senha é: <b>{chave}</b>. Use essa chave para resetar a sua senha."
    }
  }
```

ou ajustando com as opções disponíveis como no exemplo:

```js
"mixins": {
   "RecuperacaoSenha": {
        "ChaveSenha": "ChaveSenha",
        "ChaveSenhaToken": "ChaveSenhaToken",
        "emailModel": "Email",
        "senderAddress": "naoresponda@seusite.com.br",
        "subject": "Seu Aplicativo - Chave de alteração da senha",
        "html": "Sua chave para resetar a senha é: <b>{chave}</b>. Use essa chave para resetar a sua senha."
    }
  }
```

| Propriedade     | Tipo        | Requerid      | Descrição
|:---------------:|:-----------:|:-------------:|:--------------:
| ChaveSenha      | string      | Yes           | Nome do campo da tabela do usuário que irá armazenar a chave gerada
| ChaveSenhaToken | string      | Yes           | Nome do campo da tabela do usuário que irá armazenar o token de curta duração
| emailModel      | string      | Yes           | Nome do model de email que deverá ser usado
| senderAddress   | string      | Yes           | O email do remetente
| subject         | string      | Yes           | Assunto do email
| html            | string      | Yes           | Conteúdo do email que será enviado você tem a propriedade {chave} pra colocar dentro do texto

LÓGICA DE IMPLEMENTAÇÃO
========

Você solicitaria a recuperação de senha usando o método padrão do loopback `api/model/reset` que ele enviará o email para o usuário com uma chave que ele gerou.

Depois com a chave em mãos você precisa recuperar o token de curta duração para então gerar a nova senha. Então você faz uma solicitação POST  para `api/model/reset-token` com o email e a chave e ele retornará o seguinte:

```js

{
  "ChaveSenhaToken": "4o7Z0b5IWeCVncfJBU31sh80PdG8yoocd57EjUSZyGpVKrMVhswFtFXvsBoYfvkx"
}

```

Com esse token você cria uma nova senha usando o método padrão POST `api/model/reset-password?access_token=4o7Z0b5IWeCVncfJBU31sh80PdG8yoocd57EjUSZyGpVKrMVhswFtFXvsBoYfvkx` e a nova senha "newPassword"


LICENÇA
=============
[MTI](LICENSE)



