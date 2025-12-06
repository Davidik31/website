class StorageService {
    //Сохранить пользователя
    static saveUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.saveUserToUsersList(user);
    }

    //Сохранить в список всех пользователей
    static saveUserToUsersList(user) {
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUserIndex = users.findIndex(u => u.email == user.email);

        if (existingUserIndex !== -1) {
            users[existingUserIndex] = user;
        } else {
            users.push(user);
        }

        localStorage.setItem('users', JSON.stringify(users));
    }

    //Найти пользоватлея по email
    static findUserByEmail(email) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.find(user => user.email === email);
    }

    //Получить текущего пользователя
    static getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    }

    //Выйти из системы
    static logout() {
        localStorage.removeItem('currentUser');
    }

    //Проверить авторизацию
    static checkAuth() {
        return !!localStorage.getItem('currentUser');
    }

    //Сохранить заказ
    static saveOrder(order) {
        const user = this.getCurrentUser();
        if (!user) return;

        if (!user.orders) user.orders = [];
        user.orders.puch({
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            ...order
        });

        this.saveUser(user);
    }
}