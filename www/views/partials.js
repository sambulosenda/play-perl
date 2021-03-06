define([
    'underscore', 'markdown',
    'settings',
    'text!templates/partials.html'
], function (_, markdown, settings, html) {

    var el = $(html);

    return {
        user: _.template(el.find('script.user').text()),
        quest_labels: _.template(el.find('script.quest-labels').text()),
        edit_tools: _.template(el.find('script.edit-tools').text()),
        markdown: markdown,
        settings: settings
    };
});
