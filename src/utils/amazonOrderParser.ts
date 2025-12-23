import Papa from 'papaparse';
import { Todo } from '@/hooks/useTodos';

interface AmazonOrderRow {
    'order-id': string;
    'product-name': string;
    'recipient-name'?: string;
    'purchase-date'?: string;
    'quantity-purchased'?: string;
    [key: string]: string | undefined;
}

export const parseAmazonOrderReport = (file: File): Promise<Partial<Todo>[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse<AmazonOrderRow>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const todos: Partial<Todo>[] = [];

                results.data.forEach((row) => {
                    // Basic validation to ensure it looks like an order row
                    if (!row['order-id'] || !row['product-name']) {
                        return;
                    }

                    const orderId = row['order-id'];
                    const productName = truncate(row['product-name'], 50); // Keep title short
                    const recipient = row['recipient-name'] || 'Unknown';
                    const date = row['purchase-date'] || new Date().toLocaleDateString();
                    const quantity = row['quantity-purchased'] || '1';

                    const fullTitle = `${productName} (${quantity})`;
                    const amazonLink = `https://sellercentral.amazon.in/orders-v3/order/${orderId}`;

                    const note = `Order ID: ${orderId}\nRecipient: ${recipient}\nDate: ${date}\nProduct: ${row['product-name']}`; // Full details in note

                    todos.push({
                        title: fullTitle,
                        note: note,
                        amazonLink: amazonLink,
                        status: 'todo' // Default status
                    });
                });

                resolve(todos);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};

const truncate = (str: string, n: number) => {
    return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
};
