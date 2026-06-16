import type { Member } from "@/lib/mock/expenses";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function MemberAvatar({ member, size = 28 }: { member: Member; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ backgroundColor: member.color, width: size, height: size, fontSize: size * 0.38 }}
      title={`${member.name} · ${member.role}`}
    >
      {initials(member.name)}
    </span>
  );
}

export function MemberChip({ member }: { member: Member }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <MemberAvatar member={member} size={22} />
      <span className="text-sm">{member.name}</span>
    </span>
  );
}
