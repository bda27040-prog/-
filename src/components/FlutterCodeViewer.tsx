import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  FolderTree, 
  Smartphone, 
  Flame, 
  Layers, 
  Download,
  BookOpen
} from 'lucide-react';

export const FlutterCodeViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<string>('pubspec.yaml');
  const [copied, setCopied] = useState(false);

  const flutterFiles: Record<string, { path: string; language: string; content: string }> = {
    'pubspec.yaml': {
      path: 'pubspec.yaml',
      language: 'yaml',
      content: `name: aljundi_hasib
description: "تطبيق الجندي حاسب لإدارة الديون والحسابات"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter

  # Clean Architecture & State Management
  flutter_riverpod: ^2.4.9
  freezed_annotation: ^2.4.1

  # Firebase
  firebase_core: ^2.27.0
  firebase_auth: ^4.17.8
  cloud_firestore: ^4.15.8

  # UI & Design
  google_fonts: ^6.1.0
  lucide_icons: ^0.257.0
  intl: ^0.19.0
  url_launcher: ^6.2.4

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
  build_runner: ^2.4.8
  freezed: ^2.4.7

flutter:
  uses-material-design: true
  assets:
    - assets/images/
`,
    },

    'main.dart': {
      path: 'lib/main.dart',
      language: 'dart',
      content: `import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:google_fonts/google_fonts.dart';

import 'presentation/views/home_view.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const ProviderScope(child: AlJundiHasibApp()));
}

class AlJundiHasibApp extends StatelessWidget {
  const AlJundiHasibApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'الجندي حاسب',
      debugShowCheckedModeBanner: false,
      
      // Full RTL Arabic Localization
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale('ar', 'SA')],
      locale: const Locale('ar', 'SA'),

      // Modern Material 3 Theme
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF10B981), // Emerald accent
          brightness: Brightness.light,
        ),
        textFontFamily: GoogleFonts.cairo().fontFamily,
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF10B981),
          brightness: Brightness.dark,
        ),
        textFontFamily: GoogleFonts.cairo().fontFamily,
      ),
      themeMode: ThemeMode.system,

      home: const HomeView(),
    );
  }
}
`,
    },

    'customer_entity.dart': {
      path: 'lib/domain/entities/customer.dart',
      language: 'dart',
      content: `class Customer {
  final String id;
  final String name;
  final String phone;
  final String address;
  final String notes;
  final DateTime createdAt;

  Customer({
    required this.id,
    required this.name,
    required this.phone,
    this.address = '',
    this.notes = '',
    required this.createdAt,
  });

  Map<String, dynamic> toFirestore() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
      'address': address,
      'notes': notes,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory Customer.fromFirestore(Map<String, dynamic> data, String docId) {
    return Customer(
      id: docId,
      name: data['name'] ?? '',
      phone: data['phone'] ?? '',
      address: data['address'] ?? '',
      notes: data['notes'] ?? '',
      createdAt: DateTime.parse(data['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }
}
`,
    },

    'transaction_entity.dart': {
      path: 'lib/domain/entities/transaction_entity.dart',
      language: 'dart',
      content: `enum TransactionType { debit, credit } // debit = عليه (دين), credit = له (سداد)

class TransactionEntity {
  final String id;
  final String customerId;
  final TransactionType type;
  final double amount;
  final DateTime date;
  final String note;
  final String details;

  TransactionEntity({
    required this.id,
    required this.customerId,
    required this.type,
    required this.amount,
    required this.date,
    required this.note,
    this.details = '',
  });

  Map<String, dynamic> toFirestore() {
    return {
      'id': id,
      'customerId': customerId,
      'type': type == TransactionType.debit ? 'debit' : 'credit',
      'amount': amount,
      'date': date.toIso8601String(),
      'note': note,
      'details': details,
    };
  }

  factory TransactionEntity.fromFirestore(Map<String, dynamic> data, String docId) {
    return TransactionEntity(
      id: docId,
      customerId: data['customerId'] ?? '',
      type: data['type'] == 'debit' ? TransactionType.debit : TransactionType.credit,
      amount: (data['amount'] as num).toDouble(),
      date: DateTime.parse(data['date']),
      note: data['note'] ?? '',
      details: data['details'] ?? '',
    );
  }
}
`,
    },

    'firestore_service.dart': {
      path: 'lib/data/services/firestore_service.dart',
      language: 'dart',
      content: `import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/customer.dart';
import '../../domain/entities/transaction_entity.dart';

class FirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Customers Firestore CRUD
  Stream<List<Customer>> getCustomersStream() {
    return _firestore.collection('customers').snapshots().map((snapshot) {
      return snapshot.docs.map((doc) => Customer.fromFirestore(doc.data(), doc.id)).toList();
    });
  }

  Future<void> addCustomer(Customer customer) async {
    await _firestore.collection('customers').doc(customer.id).set(customer.toFirestore());
  }

  Future<void> updateCustomer(Customer customer) async {
    await _firestore.collection('customers').doc(customer.id).update(customer.toFirestore());
  }

  Future<void> deleteCustomer(String customerId) async {
    await _firestore.collection('customers').doc(customerId).delete();
    // Delete all transactions linked to customer
    final txDocs = await _firestore.collection('transactions').where('customerId', isEqualTo: customerId).get();
    for (var doc in txDocs.docs) {
      await doc.reference.delete();
    }
  }

  // Transactions CRUD
  Stream<List<TransactionEntity>> getCustomerTransactionsStream(String customerId) {
    return _firestore
        .collection('transactions')
        .where('customerId', isEqualTo: customerId)
        .orderBy('date', descending: false)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) => TransactionEntity.fromFirestore(doc.data(), doc.id)).toList();
    });
  }

  Future<void> addTransaction(TransactionEntity transaction) async {
    await _firestore.collection('transactions').doc(transaction.id).set(transaction.toFirestore());
  }
}
`,
    },

    'customer_provider.dart': {
      path: 'lib/presentation/providers/customer_provider.dart',
      language: 'dart',
      content: `import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/services/firestore_service.dart';
import '../../domain/entities/customer.dart';

final firestoreServiceProvider = Provider((ref) => FirestoreService());

final customersStreamProvider = StreamProvider<List<Customer>>((ref) {
  final service = ref.watch(firestoreServiceProvider);
  return service.getCustomersStream();
});

final searchQueryProvider = StateProvider<String>((ref) => '');

final filteredCustomersProvider = Provider<AsyncValue<List<Customer>>>((ref) {
  const query = '';
  final customersAsync = ref.watch(customersStreamProvider);
  return customersAsync.whenData((customers) {
    final q = ref.watch(searchQueryProvider).trim().toLowerCase();
    if (q.isEmpty) return customers;
    return customers.where((c) => c.name.toLowerCase().contains(q) || c.phone.contains(q)).toList();
  });
});
`,
    },

    'home_view.dart': {
      path: 'lib/presentation/views/home_view.dart',
      language: 'dart',
      content: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/customer_provider.dart';
import 'statement_view.dart';

class HomeView extends ConsumerWidget {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final customersAsync = ref.watch(filteredCustomersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('الجندي حاسب', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              // Open Settings View
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: TextField(
              onChanged: (val) => ref.read(searchQueryProvider.notifier).state = val,
              decoration: InputDecoration(
                hintText: 'ابحث عن عميل أو رقم هاتف...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                filled: true,
              ),
            ),
          ),
          Expanded(
            child: customersAsync.when(
              data: (customers) {
                if (customers.isEmpty) {
                  return const Center(child: Text('لا يوجد عملاء مسجلين حالياً'));
                }
                return ListView.builder(
                  itemCount: customers.length,
                  itemBuilder: (context, index) {
                    final customer = customers[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      child: ListTile(
                        title: Text(customer.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text(customer.phone),
                        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => StatementView(customer: customer)),
                          );
                        },
                      ),
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) => Center(child: Text('خطأ: $err')),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          // Show Add Customer Dialog
        },
        icon: const Icon(Icons.person_add),
        label: const Text('إضافة عميل'),
        backgroundColor: const Color(0xFF10B981),
      ),
    );
  }
}
`,
    },
  };

  const handleCopyCode = () => {
    const file = flutterFiles[activeFile];
    if (file) {
      navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-slate-950 p-2.5 rounded-xl font-bold">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Tajawal'] flex items-center gap-2">
              <span>مشروع فلاتر Flutter الكامل (Clean Architecture)</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Riverpod + Firebase
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              هيكل المشروع جاهز بالكامل للتطبيق في Android Studio و VS Code.
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyCode}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-emerald-500/20"
        >
          {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'تم نسخ الكود!' : 'نسخ كود الملف الحالي'}</span>
        </button>
      </div>

      {/* Code File Explorer Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* File Sidebar */}
        <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl border border-slate-800 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-emerald-400" />
            <span>ملفات مشروع فلاتر</span>
          </h3>

          <div className="space-y-1 text-xs">
            {Object.keys(flutterFiles).map((fileKey) => {
              const file = flutterFiles[fileKey];
              const isActive = activeFile === fileKey;
              return (
                <button
                  key={fileKey}
                  onClick={() => setActiveFile(fileKey)}
                  className={`w-full text-right px-3 py-2 rounded-xl transition flex items-center justify-between font-mono text-[11px] ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                      : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <span className="truncate dir-ltr text-right">{fileKey}</span>
                  <Code2 className="w-3.5 h-3.5 shrink-0 opacity-70" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Code View Area */}
        <div className="lg:col-span-3 bg-slate-950 text-slate-100 p-5 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-slate-400 dir-ltr text-left">
            <span className="text-emerald-400 font-bold">{flutterFiles[activeFile]?.path}</span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded">{flutterFiles[activeFile]?.language}</span>
          </div>

          <pre className="overflow-x-auto p-3 bg-slate-900/80 rounded-xl text-emerald-300 text-[11px] leading-relaxed dir-ltr text-left">
            <code>{flutterFiles[activeFile]?.content}</code>
          </pre>
        </div>

      </div>
    </div>
  );
};
