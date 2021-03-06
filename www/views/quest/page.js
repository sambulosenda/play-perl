define([
    'underscore',
    'views/proto/common',
    'views/quest/completed',
    'views/quest/big', 'views/comment/collection',
    'models/comment-collection',
    'models/current-user',
    'text!templates/quest-page.html'
], function (_, Common, QuestCompleted, QuestBig, CommentCollection, CommentCollectionModel, currentUser, html) {
    return Common.extend({

        activated: false,

        template: _.template(html),

        events: {
            "click .quest-action .complete": "close",
            "click .quest-action .abandon": "abandon",
            "click .quest-action .leave": "leave",
            "click .quest-action .resurrect": "resurrect",
            "click .quest-action .reopen": "reopen",

            'click .invite': 'inviteDialog',
            'click .uninvite': 'uninviteAction',
            'click .join': 'joinAction',
            'keyup #inputInvitee': 'inviteAction',
        },

        subviews: {
            '.quest-big': function () {
                return new QuestBig({
                    model: this.model
                });
            },
            '.comments': function () {
                var commentsModel = new CommentCollectionModel([], { 'quest_id': this.model.id });
                commentsModel.fetch();
                return new CommentCollection({
                    collection: commentsModel
                });
            },
        },

        inviteDialog: function () {
            var that = this;
            this.$('.invite-block button').hide();
            this.$('.invite-dialog').show(0, function () {
                that.$('.invite-dialog input').focus();
            });
        },

        inviteAction: function (e) {
            // escape
            if (e.keyCode == 27) {
                this.$('.invite-dialog').hide();
                this.$('.invite-dialog input').val('');
                this.$('.invite-block button').show();
                return;
            }

            // enter
            if (e.keyCode == 13) {
                this.model.invite(
                    this.$('#inputInvitee').val()
                );
            }
            return;
        },

        uninviteAction: function (e) {
            this.model.uninvite($(e.target).parent().attr('data-login'));
        },

        joinAction: function () {
            this.model.join();
        },

        close: function () {
            this.model.close();
            var modal = new QuestCompleted({ model: this.model });
            modal.start();
        },

        abandon: function () {
            this.model.abandon();
        },

        leave: function () {
            this.model.leave();
        },

        resurrect: function () {
            this.model.resurrect();
        },

        reopen: function () {
            this.model.reopen();
        },


        serialize: function () {
            var params = this.model.serialize();
            if (_.contains(params.invitee || [], currentUser.get('login'))) {
                params.invited = true;
            }
            else {
                params.invited = false;
            }
            params.currentUser = currentUser.get('login');
            return params;
        },

        afterInitialize: function () {
            this.listenTo(this.model, 'change', this.render);
        },
        features: ['tooltip']
    });
});
