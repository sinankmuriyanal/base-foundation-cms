// Minimal in-memory stand-ins for the parts of firebase-admin the API routes use.

type Data = Record<string, unknown>;

class FakeQuery {
  constructor(
    protected store: Map<string, Data>,
    private filters: [string, unknown][] = [],
    private order: [string, "asc" | "desc"] | null = null,
    private max = Infinity
  ) {}

  where(field: string, _op: "==", value: unknown) {
    return new FakeQuery(this.store, [...this.filters, [field, value]], this.order, this.max);
  }
  orderBy(field: string, dir: "asc" | "desc" = "asc") {
    return new FakeQuery(this.store, this.filters, [field, dir], this.max);
  }
  limit(n: number) {
    return new FakeQuery(this.store, this.filters, this.order, n);
  }
  async get() {
    let rows = [...this.store.entries()].filter(([, d]) => this.filters.every(([f, v]) => d[f] === v));
    if (this.order) {
      const [f, dir] = this.order;
      rows.sort(([, a], [, b]) => ((a[f] as number) - (b[f] as number)) * (dir === "asc" ? 1 : -1));
    }
    rows = rows.slice(0, this.max);
    const docs = rows.map(([id, d]) => ({ id, data: () => d }));
    return { empty: docs.length === 0, docs };
  }
}

class FakeCollection extends FakeQuery {
  private nextId = 1;
  doc(id: string) {
    const store = this.store;
    return {
      async get() {
        const d = store.get(id);
        return { id, exists: !!d, data: () => d };
      },
      async update(patch: Data) {
        if (!store.has(id)) throw new Error("not found");
        store.set(id, { ...store.get(id), ...patch });
      },
      async set(data: Data, opts?: { merge?: boolean }) {
        store.set(id, opts?.merge ? { ...store.get(id), ...data } : data);
      },
      async delete() {
        store.delete(id);
      },
    };
  }
  async add(data: Data) {
    const id = `doc${this.nextId++}`;
    this.store.set(id, data);
    return { id };
  }
}

export function createFakeDb() {
  const collections = new Map<string, FakeCollection>();
  return {
    collection(name: string) {
      if (!collections.has(name)) collections.set(name, new FakeCollection(new Map()));
      return collections.get(name)!;
    },
  };
}

export type FakeDb = ReturnType<typeof createFakeDb>;
