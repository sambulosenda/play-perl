define([
    'backbone', 'jquery',
    'models/current-user'
], function (Backbone, $, currentUser) {
    return Backbone.Model.extend({
        idAttribute: '_id',
        urlRoot: '/api/quest',

        like: function() {
            this.act('like');
        },

        unlike: function() {
            this.act('unlike');
        },

        invite: function(invitee) {
            this.act('invite', { invitee: invitee });
        },

        uninvite: function(invitee) {
            this.act('uninvite', { invitee: invitee });
        },

        join: function() {
            this.act('join');
        },

        leave: function() {
            this.act('leave');
        },

        close: function() {
            this._setStatus('closed');
        },

        abandon: function() {
            this._setStatus('abandoned');
        },

        resurrect: function() {
            this._setStatus('open');
        },

        reopen: function() {
            this._setStatus('open');
        },

        _setStatus: function(st) {
            var model = this.model;
            this.save(
                { "status": st },
                {
                    success: function (model) {
                        if (_.contains(model.get('team'), currentUser.get('login'))) {
                            // update of the current user's quest causes update in points
                            currentUser.fetch();
                        }
                    }
                }
            );
        },

        act: function(action, params) {
            var model = this;

            // FIXME - copypasted from models/comment.js
            // TODO - send only on success?
            ga('send', 'event', 'quest', action);
            mixpanel.track(action + ' quest');

            $.post(this.url() + '/' + action, params)
                .success(function () {
                    model.fetch();
                }); // TODO - error handling?
        },

        comment_count: function () {
            return this.get('comment_count') || 0;
        },

        like_count: function () {
            var likes = this.get('likes');
            if (likes) {
                return likes.length;
            }
            return 0;
        },

        extStatus: function () {
            var status = this.get('status');

            if (status == 'open' && this.get('team').length == 0) return 'unclaimed';
            return status;
        },

        reward: function () {
            return 1 + (this.get('likes') ? this.get('likes').length : 0);
        },

        isOwned: function () {
            var currentLogin = currentUser.get('login');
            if (!currentLogin || !currentLogin.length) {
                return;
            }
            return _.contains(this.get('team') || [], currentLogin);
        },

        // augments attributes with 'ext_status'
        serialize: function () {
            var params = this.toJSON();
            params.ext_status = this.extStatus();
            params.reward = this.reward();
            if (params.tags) {
                params.tags = params.tags.sort();
            }
            else {
                params.tags = [];
            }
            params.my = this.isOwned();
            if (!params.likes) {
                params.likes = [];
            }
            return params;
        },

        // static methods
        tagline2tags: function (tagLine) {
            var tags = tagLine.split(',');
            tags = _.map(tags, function (tag) {
                tag = tag.replace(/^\s+|\s+$/g, '');
                return tag;
            });
            tags = _.filter(tags, function (tag) {
                return (tag != '');
            });
            return tags.sort();
        },

        validateTagline: function (tagLine) {
            return Boolean(tagLine.match(/^\s*([\w-]+\s*,\s*)*([\w-]+\s*)?$/));
        }

    });
});
