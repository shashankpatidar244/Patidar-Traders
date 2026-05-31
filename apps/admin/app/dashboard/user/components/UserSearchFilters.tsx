import SearchFilterBar, {
  FilterField,
} from "../../../components/shared/SearchFilterBar";

const fields: FilterField[] = [
  {
    key: "role",
    label: "Role",
    options: [
      {
        label: "Admin",
        value: "ADMIN",
      },
      {
        label: "User",
        value: "USER",
      },
    ],
  },

  {
    key: "status",
    label: "Status",
    options: [
      {
        label: "Active",
        value: "ACTIVE",
      },
      {
        label: "Blocked",
        value: "BLOCKED",
      },
    ],
  },

  {
    key: "sort",
    label: "Sort",
    isSortEngine: true,
    options: [
      {
        label: "Newest",
        value: "newest",
      },
      {
        label: "Oldest",
        value: "oldest",
      },
      {
        label: "UserName A → Z",
        value: "name_asc",
      },
      {
        label: "Username Z → A",
        value: "name_desc",
      },
    ],
  },
];

export default function UserSearchFilters() {
  return (
    <SearchFilterBar
      fields={fields}
      globalSearchKey="search"
      globalSearchPlaceholder="Search users by username or phone..."
    />
  );
}
