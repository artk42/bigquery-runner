import React, { FC, HTMLProps, useEffect, useState } from "react";
import { NumberedRows, Page } from "core";
import cx from "classnames";
import "./App.css";

type Rows = {
  source: "bigquery-runner";
  payload: Event;
};

function isData(data: any): data is Rows {
  return data.source === "bigquery-runner";
}

type Event = OpenEvent | CloseEvent | RowsEvent;

type OpenEvent = {
  event: "open";
  payload: undefined;
};

function isOpenEvent(e: Event): e is OpenEvent {
  return e.event === "open";
}

type CloseEvent = {
  event: "close";
  payload: undefined;
};

function isCloseEvent(e: Event): e is CloseEvent {
  return e.event === "close";
}

type Data = {
  header: Array<string>;
  rows: Array<NumberedRows>;
  page?: Page;
  numRows: string;
};

type RowsEvent = {
  event: "rows";
  payload: Data;
};

function isRowsEvent(e: Event): e is RowsEvent {
  return e.event === "rows";
}

const App: FC = () => {
  const [data, setData] = useState<Data | undefined>(defaultData);
  const [loading, setLoading] = useState<string | undefined>("Initializing");
  const [isPending, startTransition] = (React as any).useTransition({
    timeoutMs: 5000,
  });

  useEffect(() => {
    window.addEventListener("message", (e: MessageEvent) => {
      if (!isData(e.data)) {
        return;
      }
      const {
        data: { payload },
      } = e;
      console.log(payload);
      if (isOpenEvent(payload)) {
        setLoading("Fetching");
        return;
      }
      if (isRowsEvent(payload)) {
        setLoading(undefined);
        startTransition(() => {
          setData(payload.payload);
        });
        return;
      }
      if (isCloseEvent(payload)) {
        setLoading(undefined);
        return;
      }
      throw new Error(`undefined data payload '${payload}'`);
    });
  }, [startTransition]);

  useEffect(() => {
    if (isPending) {
      setLoading("Rendering");
    } else {
      setLoading(undefined);
    }
  }, [isPending]);

  return (
    <Box>
      {loading ? (
        <HStack className="loading" p={2} gap={1}>
          <Spinner />
          <Text color="weak">{loading}</Text>
        </HStack>
      ) : null}
      <VStack p={3}>
        {data ? (
          <table>
            <thead>
              <Tr>
                <RowNumberTh>Row</RowNumberTh>
                {data.header.map((head) => (
                  <Th key={head}>{head}</Th>
                ))}
              </Tr>
            </thead>
            <tbody>
              {data.rows.map(({ rowNumber, rows }, i) => {
                const lastRow = i === data.rows.length - 1;
                return rows.map((row, j) => (
                  <Tr
                    key={j}
                    className={cx({
                      lastOfRowNumber: lastRow && j === 0,
                    })}
                  >
                    {j === 0 ? (
                      <RowNumberTd rowSpan={rows.length}>
                        {rowNumber}
                      </RowNumberTd>
                    ) : null}
                    {row.map((cell) => (
                      <Td key={cell.id}>{cell.value}</Td>
                    ))}
                  </Tr>
                ));
              })}
            </tbody>
            <tfoot>
              <tr>
                <Th colSpan={data.header.length + 1}>
                  <HStack className="spacebetween">
                    {data.page ? (
                      <Pagination
                        page={data.page}
                        rowsInPage={data.rows.length}
                        totalRows={data.numRows}
                      />
                    ) : null}
                  </HStack>
                </Th>
              </tr>
            </tfoot>
          </table>
        ) : null}
      </VStack>
    </Box>
  );
};

const Pagination: FC<{ page: Page; rowsInPage: number; totalRows: string }> = ({
  page,
  rowsInPage,
  totalRows,
  ...props
}) => (
  <HStack gap={1} {...props}>
    <Text color="weak">{page.rowsPerPage * page.current + 1}</Text>
    <Text color="weak">-</Text>
    <Text color="weak">{page.rowsPerPage * page.current + rowsInPage}</Text>
    <Text color="weak">/</Text>
    <Text color="weak">{totalRows}</Text>
  </HStack>
);

type XFC<P = {}> = FC<P & { className?: string }>;

type BoxProps = {
  readonly p?: 1 | 2 | 3;
  readonly px?: 1 | 2 | 3;
  readonly py?: 1 | 2 | 3;
  readonly gap?: 1 | 2 | 3;
};
const Box: XFC<BoxProps> = ({ className, p, px, py, gap, ...props }) => (
  <div
    className={cx(
      "box",
      {
        [`px-${p ?? px}`]: !!p || !!px,
        [`py-${p ?? py}`]: !!p || !!py,
        [`gap-${gap}`]: !!gap,
      },
      className
    )}
    {...props}
  />
);

type StackProps = BoxProps & {
  readonly direction: "vertical" | "horizontal";
};
const Stack: XFC<StackProps> = ({ className, direction, ...props }) => (
  <Box
    className={cx("stack", { [`stack-${direction}`]: true }, className)}
    {...props}
  />
);

type VStackProps = Omit<StackProps, "direction">;
const VStack: XFC<VStackProps> = (props) => (
  <Stack direction="vertical" {...props} />
);

type HStackProps = Omit<StackProps, "direction">;
const HStack: XFC<HStackProps> = ({ ...props }) => (
  <Stack direction="horizontal" {...props} />
);

const Tr: XFC<HTMLProps<HTMLTableRowElement>> = ({ className, ...props }) => (
  <tr className={cx("headerCell", className)} {...props} />
);

const Th: XFC<HTMLProps<HTMLTableCellElement>> = ({ className, ...props }) => (
  <th className={cx("headerCell", className)} {...props} />
);

const RowNumberTh: typeof Th = ({ className, ...props }) => (
  <Th className={cx("rowNumber", className)} {...props} />
);

const Td: XFC<HTMLProps<HTMLTableCellElement>> = ({ className, ...props }) => (
  <td className={cx("dataCell", className)} {...props} />
);

const RowNumberTd: typeof Td = ({ className, ...props }) => (
  <Td className={cx("rowNumber", className)} {...props} />
);

const Text: XFC<{ color?: "weak" }> = ({ className, color, ...props }) => (
  <span className={cx({ weakColor: color === "weak" }, className)} {...props} />
);

const Spinner: FC = () => <div className="spinner" />;

const defaultData = undefined;
// const defaultData = {
//   header: [
//     "order_id",
//     "items.product_id",
//     "items.quantity",
//     "items.name",
//     "items.price",
//   ],
//   rows: [
//     {
//       rowNumber: 0,
//       rows: [
//         [
//           { id: "order_id", value: 1 },
//           { id: "items.product_id", value: 1001 },
//           { id: "items.quantity", value: 4 },
//           { id: "items.name", value: "wallet" },
//           { id: "items.price", value: 30000 },
//         ],
//         [
//           { id: "order_id", value: 1 },
//           { id: "items.product_id", value: 1001 },
//           { id: "items.quantity", value: 4 },
//           { id: "items.name", value: "wallet" },
//           { id: "items.price", value: 30000 },
//         ],
//         [
//           { id: "order_id", value: 1 },
//           { id: "items.product_id", value: 1001 },
//           { id: "items.quantity", value: 4 },
//           { id: "items.name", value: "wallet" },
//           { id: "items.price", value: 30000 },
//         ],
//       ],
//     },
//     {
//       rowNumber: 0,
//       rows: [
//         [
//           { id: "order_id", value: 1 },
//           { id: "items.product_id", value: 1001 },
//           { id: "items.quantity", value: 4 },
//           { id: "items.name", value: "wallet" },
//           { id: "items.price", value: 30000 },
//         ],
//         [
//           { id: "order_id", value: 1 },
//           { id: "items.product_id", value: 1001 },
//           { id: "items.quantity", value: 4 },
//           { id: "items.name", value: "wallet" },
//           { id: "items.price", value: 30000 },
//         ],
//         [
//           { id: "order_id", value: 1 },
//           { id: "items.product_id", value: 1001 },
//           { id: "items.quantity", value: 4 },
//           { id: "items.name", value: "wallet" },
//           { id: "items.price", value: 30000 },
//         ],
//       ],
//     },
//     {
//       rowNumber: 0,
//       rows: [
//         [
//           { id: "order_id", value: 1 },
//           { id: "items.product_id", value: 1001 },
//           { id: "items.quantity", value: 4 },
//           { id: "items.name", value: "wallet" },
//           { id: "items.price", value: 30000 },
//         ],
//         [
//           { id: "order_id", value: 1 },
//           { id: "items.product_id", value: 1001 },
//           { id: "items.quantity", value: 4 },
//           { id: "items.name", value: "wallet" },
//           { id: "items.price", value: 30000 },
//         ],
//         [
//           { id: "order_id", value: 1 },
//           { id: "items.product_id", value: 1001 },
//           { id: "items.quantity", value: 4 },
//           { id: "items.name", value: "wallet" },
//           { id: "items.price", value: 30000 },
//         ],
//       ],
//     },
//     {
//       rowNumber: 0,
//       rows: [
//         [
//           { id: "order_id", value: 1 },
//           { id: "items.product_id", value: 1001 },
//           { id: "items.quantity", value: 4 },
//           { id: "items.name", value: "wallet" },
//           { id: "items.price", value: 30000 },
//         ],
//         [
//           { id: "order_id", value: 1 },
//           { id: "items.product_id", value: 1001 },
//           { id: "items.quantity", value: 4 },
//           { id: "items.name", value: "wallet" },
//           { id: "items.price", value: 30000 },
//         ],
//         [
//           { id: "order_id", value: 1 },
//           { id: "items.product_id", value: 1001 },
//           { id: "items.quantity", value: 4 },
//           { id: "items.name", value: "wallet" },
//           { id: "items.price", value: 30000 },
//         ],
//       ],
//     },
//     {
//       rowNumber: 0,
//       rows: [
//         [
//           { id: "order_id", value: 1 },
//           { id: "items.product_id", value: 1001 },
//           { id: "items.quantity", value: 4 },
//           { id: "items.name", value: "wallet" },
//           { id: "items.price", value: 30000 },
//         ],
//         [
//           { id: "order_id", value: 1 },
//           { id: "items.product_id", value: 1001 },
//           { id: "items.quantity", value: 4 },
//           { id: "items.name", value: "wallet" },
//           { id: "items.price", value: 30000 },
//         ],
//         [
//           { id: "order_id", value: 1 },
//           { id: "items.product_id", value: 1001 },
//           { id: "items.quantity", value: 4 },
//           { id: "items.name", value: "wallet" },
//           { id: "items.price", value: 30000 },
//         ],
//       ],
//     },
//     {
//       rowNumber: 0,
//       rows: [
//         [
//           { id: "order_id", value: 1 },
//           { id: "items.product_id", value: 1001 },
//           { id: "items.quantity", value: 4 },
//           { id: "items.name", value: "wallet" },
//           { id: "items.price", value: 30000 },
//         ],
//         [
//           { id: "order_id", value: 1 },
//           { id: "items.product_id", value: 1001 },
//           { id: "items.quantity", value: 4 },
//           { id: "items.name", value: "wallet" },
//           { id: "items.price", value: 30000 },
//         ],
//         [
//           { id: "order_id", value: 1 },
//           { id: "items.product_id", value: 1001 },
//           { id: "items.quantity", value: 4 },
//           { id: "items.name", value: "wallet" },
//           { id: "items.price", value: 30000 },
//         ],
//       ],
//     },
//     {
//       rowNumber: 1,
//       rows: [
//         [
//           { id: "order_id", value: 1 },
//           { id: "items.product_id", value: 1001 },
//           { id: "items.quantity", value: 4 },
//           { id: "items.name", value: "wallet" },
//           { id: "items.price", value: 30000 },
//         ],
//         [
//           { id: "order_id", value: 1 },
//           { id: "items.product_id", value: 1001 },
//           { id: "items.quantity", value: 4 },
//           { id: "items.name", value: "wallet" },
//           { id: "items.price", value: 30000 },
//         ],
//       ],
//     },
//     {
//       rowNumber: 1,
//       rows: [
//         [
//           { id: "order_id", value: 1 },
//           { id: "items.product_id", value: 1001 },
//           { id: "items.quantity", value: 4 },
//           { id: "items.name", value: "wallet" },
//           { id: "items.price", value: 30000 },
//         ],
//         [
//           { id: "order_id", value: 1 },
//           { id: "items.product_id", value: 1001 },
//           { id: "items.quantity", value: 4 },
//           { id: "items.name", value: "wallet" },
//           { id: "items.price", value: 30000 },
//         ],
//       ],
//     },
//   ],
//   page: { rowsPerPage: 100, current: 2 },
//   numRows: "123000",
// };

export default App;
