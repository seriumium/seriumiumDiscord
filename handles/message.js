const flow = require('@flow')
const structures = require('@structures')
const translates = require('@translates')

const {EndPreferenceIndicator, MessageParser, PermissionParser, PreferenceIndicator, PromptIndicator, ReportException} = structures

const prompts = PromptIndicator

const MessageHandler = (rawMessage, client) => {
  // NOTE: Remove all un-handled requests.
  if (rawMessage.author.bot || rawMessage.channel.type === 'dm') return

  const message = MessageParser(rawMessage)
  const permission = PermissionParser(rawMessage)

  const Exceptions = [
    (message.content.startsWith(PreferenceIndicator.App.Prefix)),
    (message.guild.me.hasPermission('SEND_MESSAGES')),
    (message._se.prompt in prompts)
  ]
  if (!Exceptions.includes(false)) {
    EndPreferenceIndicator.getGuildSettings(message.guild.id).then(guildPreference => {
      try {
        const PostExceptions =
          (guildPreference[`prompt.${message._se.prompt}`] === false) ||
          (!PermissionParser.isValidFor(prompts[message._se.prompt].properties.requiredPermission, permission))
        if (PostExceptions) return

        EndPreferenceIndicator.getUserSettings(message.author.id).then(userPreference => {
          // NOTE: Paste extra values.
          message._se.permission = permission
          message._se.translates = translates['ko' /*userPreference.language*/].prompts[message._se.prompt]
          message._se.translates._language = 'ko'

          console.log(message._se);

          // NOTE: Execution of function.
          prompts[message._se.prompt](message, client)
        }).catch(error => console.error(error))
      } catch (error) {
        console.error(error)
      }
    }).catch(error => console.error(error))
  }

  // NOTE: Post tasks
  flow.message(message)
}

module.exports = MessageHandler
