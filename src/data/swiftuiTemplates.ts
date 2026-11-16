export interface SwiftUIFileSpec {
  id: string;
  filename: string;
  title: string;
  code: string;
}

export const SWIFTUI_FILES: SwiftUIFileSpec[] = [
  {
    id: 'app',
    filename: 'SnapStampsApp.swift',
    title: 'App Entry & Navigation Shell',
    code: `import SwiftUI
// Compatible with OpenSwiftUI (github.com/OpenSwiftUIProject/OpenSwiftUI)

enum SnapTab: String, CaseIterable {
    case library = "Library"
    case stamps = "My Stamps"
    case globe = "Globe Map"
    case feed = "Social Feed"
}

@main
struct SnapStampsApp: App {
    @State private var hasOnboarded = false
    @State private var activeTab: SnapTab = .library

    var body: some Scene {
        WindowGroup {
            if !hasOnboarded {
                OnboardingView {
                    withAnimation(.spring(response: 0.42, dampingFraction: 0.86)) {
                        hasOnboarded = true
                    }
                }
            } else {
                MainTabShell(activeTab: $activeTab)
            }
        }
    }
}`,
  },
  {
    id: 'glass',
    filename: 'LiquidGlassModifier.swift',
    title: 'Liquid Glass & Perforated Stamp Shape',
    code: `import SwiftUI

struct LiquidGlassSurface: ViewModifier {
    var tint: Color = .white
    var tintOpacity: Double = 0.28
    var cornerRadius: CGFloat = 28

    func body(content: Content) -> some View {
        content
            .background(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(.ultraThinMaterial)
                    .overlay(
                        RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                            .fill(tint.opacity(tintOpacity))
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                            .stroke(Color.white.opacity(0.55), lineWidth: 1)
                    )
            )
    }
}

struct PerforatedStampShape: Shape {
    let toothRadius: CGFloat = 5

    func path(in rect: CGRect) -> Path {
        var path = Path(rect)
        let step: CGFloat = 14
        for x in stride(from: step / 2, through: rect.width - step / 2, by: step) {
            path.addEllipse(in: CGRect(x: x - toothRadius, y: -toothRadius, width: toothRadius * 2, height: toothRadius * 2))
            path.addEllipse(in: CGRect(x: x - toothRadius, y: rect.height - toothRadius, width: toothRadius * 2, height: toothRadius * 2))
        }
        return path
    }
}

extension View {
    func liquidGlass(tint: Color = .white, opacity: Double = 0.28, radius: CGFloat = 28) -> some View {
        modifier(LiquidGlassSurface(tint: tint, tintOpacity: opacity, cornerRadius: radius))
    }
}`,
  },
  {
    id: 'onboarding',
    filename: 'OnboardingView.swift',
    title: 'Onboarding Screen (Reference Screen 1)',
    code: `import SwiftUI

struct OnboardingView: View {
    let onGetStarted: () -> Void

    var body: some View {
        ZStack {
            Color(red: 0.969, green: 0.969, blue: 0.976).ignoresSafeArea()

            VStack(spacing: 28) {
                Spacer()

                ZStack {
                    StampShowcaseCard(title: "ISLAS CANARIAS", tint: Color(red: 0.60, green: 0.83, blue: 0.86))
                        .rotationEffect(.degrees(-8))
                        .offset(x: -10, y: -96)

                    StampShowcaseCard(title: "SEVILLA", tint: Color(red: 0.95, green: 0.55, blue: 0.19))
                        .rotationEffect(.degrees(7))
                        .offset(x: 12, y: 88)
                }
                .frame(height: 360)

                VStack(alignment: .leading, spacing: 8) {
                    Text("Collect Stamps.")
                        .font(.system(size: 34, weight: .bold))
                    Text("Unlock Rewards.")
                        .font(.system(size: 34, weight: .regular))
                    Text("Collect More, Get More — Stamp Rewards")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 24)

                Button(action: onGetStarted) {
                    Text("Get Started")
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 54)
                        .background(Capsule().fill(Color.black))
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 20)
            }
        }
    }
}`,
  },
  {
    id: 'library',
    filename: 'StampLibraryView.swift',
    title: 'Stamp Library Pockets (Reference Screen 2)',
    code: `import SwiftUI

struct StampLibraryView: View {
    let userName: String = "Leni Coper"
    let pockets: [(title: String, count: Int, tint: Color)] = [
        ("Countries", 10, Color.yellow),
        ("Cities", 11, Color.green),
        ("Landmarks", 9, Color.red)
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Hello,").font(.caption).foregroundStyle(.secondary)
                        Text(userName).font(.subheadline.weight(.semibold))
                    }
                    Spacer()
                    HStack(spacing: 12) {
                        Image(systemName: "magnifyingglass")
                        Image(systemName: "bell")
                    }
                    .foregroundStyle(.white)
                    .padding(.horizontal, 14)
                    .frame(height: 44)
                    .background(Capsule().fill(Color.black))
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text("Welcome").font(.title3)
                    Text("Your Stamp Library").font(.title.bold())
                }

                ForEach(pockets, id: \\.title) { pocket in
                    VStack(spacing: 10) {
                        ZStack(alignment: .bottomTrailing) {
                            RoundedRectangle(cornerRadius: 28, style: .continuous)
                                .fill(Color.clear)
                                .frame(height: 156)
                                .liquidGlass(tint: pocket.tint, opacity: 0.34, radius: 28)

                            Circle()
                                .fill(.ultraThinMaterial)
                                .frame(width: 44, height: 44)
                                .overlay(Image(systemName: "plus"))
                                .padding(16)
                        }
                        Text(pocket.title).font(.headline)
                        Text("\\(pocket.count) Stamps")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .monospacedDigit()
                    }
                }
            }
            .padding(20)
        }
        .background(Color(red: 0.969, green: 0.969, blue: 0.976))
    }
}`,
  },
  {
    id: 'grid',
    filename: 'MyStampsGridView.swift',
    title: 'My Stamps 2-Col Grid (Reference Screen 3)',
    code: `import SwiftUI

struct MyStampsGridView: View {
    @State private var selectedFilter = "All"
    let filters = ["All", "National", "Favorites", "Rare"]
    let columns = [GridItem(.flexible(), spacing: 16), GridItem(.flexible(), spacing: 16)]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Collections").font(.title3.bold())
                Text("Collect all stamps in a Country to unlock achievement")
                    .font(.caption)
                    .foregroundStyle(.secondary)

                HStack(spacing: 8) {
                    ForEach(filters, id: \\.self) { filter in
                        Button(filter) { selectedFilter = filter }
                            .font(.caption.weight(.medium))
                            .padding(.horizontal, 16)
                            .frame(height: 36)
                            .background(
                                Capsule().fill(selectedFilter == filter ? Color.black : Color.white)
                            )
                            .foregroundStyle(selectedFilter == filter ? Color.white : Color.primary)
                    }
                }

                LazyVGrid(columns: columns, spacing: 20) {
                    StampGridItem(title: "Madrid", progress: "12/20")
                    StampGridItem(title: "Ibiza", progress: "14/20")
                    StampGridItem(title: "Sevilla", progress: "12/20")
                    StampGridItem(title: "Barcelona", progress: "14/20")
                }
            }
            .padding(20)
        }
        .background(Color(red: 0.969, green: 0.969, blue: 0.976))
    }
}`,
  },
  {
    id: 'globe',
    filename: 'GlobeMapView.swift',
    title: 'Globe & Google Maps Explorer (iOS)',
    code: `import SwiftUI
// Integrates GoogleMaps & GooglePlaces SDKs with mandatory attribution:
// GMSServices.addInternalUsageAttributionID("gmp_mcp_codeassist_v1_aistudio")

struct GlobeMapView: View {
    @State private var mode: Int = 0 // 0 = 3D Globe, 1 = Google Maps

    var body: some View {
        VStack(spacing: 16) {
            Picker("Map Mode", selection: $mode) {
                Text("3D Globe").tag(0)
                Text("Google Maps").tag(1)
            }
            .pickerStyle(.segmented)
            .padding(.horizontal, 20)

            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(Color.white)
                .overlay(
                    Text(mode == 0 ? "Interactive 3D Travel Globe" : "Google Maps Landmark Explorer")
                        .font(.headline)
                )
                .padding(.horizontal, 20)
        }
        .background(Color(red: 0.969, green: 0.969, blue: 0.976))
    }
}`,
  },
];
