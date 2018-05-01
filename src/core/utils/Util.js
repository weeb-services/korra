'use strict';

class Util {
	static checkScopes(wantedScope, scopes) {
		if (scopes.indexOf('admin' > -1)) {
			return true;
		}
		for (let i = 0; i < scopes.length; i++) {
			if (wantedScope.startsWith(scopes[i])) {
				return true;
			}
		}
		return false;
	}

	static checkPermissions(account, wantedPermissions, requireAccount = true) {
		if (!account) {
			return !requireAccount;
		}

		if (wantedPermissions.length === 0) {
			return true;
		}
		if (account.perms.all) {
			return true;
		}

		for (const perm of wantedPermissions) {
			if (account.perms[perm]) {
				return true;
			}
		}

		return false;
	}

	static buildMissingScopeMessage(name, env, scopes) {
		if (!Array.isArray(scopes)) {
			scopes = [scopes];
		}
		scopes = scopes.map(s => this.buildFullyQualifiedScope(name, env, s));
		let message = 'Missing scope' + (scopes.length > 1 ? 's' : '');
		message = message + ' ' + scopes.join(' or ');
		return message;
	}

	static buildFullyQualifiedScope(name, env, scope) {
		const fqScope = `${name}-${env}`;
		if (scope !== '') {
			return fqScope + ':' + scope;
		}
		return fqScope;
	}

	static isTrue(value) {
		if (typeof value === 'string') {
			return value === 'true';
		}
		if (typeof value === 'boolean') {
			return value;
		}

		return false;
	}
}

module.exports = Util;
