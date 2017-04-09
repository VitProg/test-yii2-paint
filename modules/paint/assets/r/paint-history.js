var history_max_len = 30;


function PaintHistory(o) {
    this.init(o);
}

PaintHistory.prototype = {
    curr_idx: 0,

    list: null,

    init: function (o) {
        this.list = [];
        this.list.push(o);
        this.curr_idx = 0;
    },

    save: function (o) {
        if (this.curr_idx + 1 < this.list.length) {
            this.list[++this.curr_idx] = o;

            // erase forward history
            this.list.length = this.curr_idx + 1;
        }
        else if (this.list.length < history_max_len) {
            //alert(2)
            this.curr_idx = this.list.length;
            this.list.push(o);
        }
        else // shift array
        {
            /*
             for (var i = 1; i < this.list.length; ++i)
             {
             this.list[i - 1] = this.list[i];
             }
             */

            this.list.shift();

            if (this.list.length) {
                this.list[this.list.length - 1] = o;
            }
        }
    },

    can_undo: function () {
        return this.curr_idx > 0;
    },

    can_redo: function () {
        return this.curr_idx + 1 < this.list.length;
    },

    undo: function () {
        if (this.can_undo()) {
            --this.curr_idx;
            return true;
        }

        return false;
    },

    redo: function () {
        if (this.can_redo()) {
            ++this.curr_idx;
            return true;
        }

        return false;
    },

    curr: function () {
        return this.list[this.curr_idx];
    },

    clear: function (o) {
        delete this.list;
        this.list = null;
        this.init(o);
    }
};