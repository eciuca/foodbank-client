export class DashboardItem {
    private _bankShortName: string;
    private _type: string;
    private _subtype: string;
    private _key: string;
    private _value: string;

    get bankShortName(): string {
        return this._bankShortName;
    }

    set bankShortName(value: string) {
        this._bankShortName = value;
    }

    get type(): string {
        return this._type;
    }

    set type(value: string) {
        this._type = value;
    }

    get subtype(): string {
        return this._subtype;
    }

    set subtype(value: string) {
        this._subtype = value;
    }

    get key(): string {
        return this._key;
    }

    set key(value: string) {
        this._key = value;
    }

    get value(): string {
        return this._value;
    }

    set value(value: string) {
        this._value = value;
    }
}