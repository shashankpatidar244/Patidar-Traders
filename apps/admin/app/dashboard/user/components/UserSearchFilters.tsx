import SearchFilterBar, {
    FilterField,
  } from "../../components/SearchFilterBar";
  
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
          label: "Username A-Z",
          value: "name_asc",
        },
  
        {
          label: "Newest First",
          value: "newest",
        },
  
        {
          label: "Oldest First",
          value: "oldest",
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