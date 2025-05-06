
//import { Text, View } from '@/components/Themed';
import { FlatList, TextInput, StyleSheet } from 'react-native';
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { HStack } from "@/components/ui/hstack"
//import { Image } from "@/components/ui/image"
//import { Link, LinkText } from "@/components/ui/link"
import { Text } from "@/components/ui/text"
//import { Icon, ArrowRightIcon } from "@/components/ui/icon"


// 顶部标签导航
//const TopTab = MaterialTopTabNavigator();
// 模拟业务数据
const businessData = [
  {
    id: '1',
    title: '土地转移登记',
    time: '2023-09-21 17:30:00',
    currentStep: '复审',
    handler: '林一',
    businessNo: '2022082600001',
    location: '包头市九原区沙河镇健康路1号街坊',
    owner: '张三'
  },
  // 可添加更多类似数据
];
const BusinessBaseCard=()=>(
  <Card className="p-5 rounded-lg max-w-[360px] m-3">
      {/* <Image
        source={{
          uri: "https://gluestack.github.io/public-blog-video-assets/yoga.png",
        }}
        className="mb-6 h-[240px] w-full rounded-md aspect-[263/240]"
        alt="image"
      /> */}
      <Text className="text-sm font-normal mb-2 text-typography-700">
        May 15, 2023
      </Text>
      <Heading size="md" className="mb-4">
        The Power of Positive Thinking
      </Heading>
      {/* <Link href="https://gluestack.io/" isExternal>
        <HStack className="items-center">
          <LinkText
            size="sm"
            className="font-semibold text-info-600 no-underline"
          >
            Read Blog
          </LinkText>
          <Icon
            as={ArrowRightIcon}
            size="sm"
            className="text-info-600 mt-0.5 ml-0.5"
          />
        </HStack>
      </Link> */}
    </Card>
)
// 单个业务卡片组件
// const BusinessCard = ({ item }:any) => (
//   <View style={styles.card}>
//     <Text style={styles.title}>{item.title}</Text>
//     <Text style={styles.time}>{item.time}</Text>
//     <View style={styles.details}>
//       <Text style={styles.detailLabel}>当前环节：</Text>
//       <Text style={styles.detailText}>{item.currentStep}</Text>
//     </View>
//     <View style={styles.details}>
//       <Text style={styles.detailLabel}>经办人：</Text>
//       <Text style={styles.detailText}>{item.handler}</Text>
//     </View>
//     <View style={styles.details}>
//       <Text style={styles.detailLabel}>业务号：</Text>
//       <Text style={styles.detailText}>{item.businessNo}</Text>
//     </View>
//     <View style={styles.details}>
//       <Text style={styles.detailLabel}>坐落：</Text>
//       <Text style={styles.detailText}>{item.location}</Text>
//     </View>
//     <View style={styles.details}>
//       <Text style={styles.detailLabel}>权利人：</Text>
//       <Text style={styles.detailText}>{item.owner}</Text>
//     </View>
//     <Text style={styles.viewButton}>查看 →</Text>
//   </View>
// );

// const OnlineApproval = () => (
//   <View style={styles.container}>
//     {/* <TopTab.Navigator>
//       <TopTab.Screen name="待办件" component={() => ( */}
//         <View>
//           <View style={styles.searchBarContainer}>
//             <TextInput
//               style={styles.searchBar}
//               placeholder="请输入要搜索的内容"
//             />
//             <Ionicons name="filter" size={24} color="gray" style={styles.filterIcon} />
//           </View>
//           <FlatList
//             data={businessData}
//             renderItem={({ item }) => <BusinessCard item={item} />}
//             keyExtractor={(item) => item.id}
//           />
//         </View>
//       {/* )} />
//       <TopTab.Screen name="已完成" component={() => <View />} />
//       <TopTab.Screen name="已挂起" component={() => <View />} />
//     </TopTab.Navigator> */}
//   </View>
// );
export default function TabOneScreen() {
  return (
    <BusinessBaseCard/>
  );
}

// 样式定义
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff' // 浅蓝色背景
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20
  },
  searchBar: {
    flex: 1,
    marginRight: 10
  },
  filterIcon: {
    marginHorizontal: 10
  },
  card: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 10
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5
  },
  time: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 10
  },
  details: {
    flexDirection: 'row',
    marginBottom: 5
  },
  detailLabel: {
    fontWeight: 'bold',
    width: 80
  },
  detailText: {
    flex: 1
  },
  viewButton: {
    color: 'blue',
    textAlign: 'right',
    marginTop: 10
  }
});
